from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import json
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone

from emergentintegrations.llm.chat import LlmChat, UserMessage, TextDelta, StreamDone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

app = FastAPI()
api_router = APIRouter(prefix="/api")


class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class StatusCheckCreate(BaseModel):
    client_name: str


# ---- AI Copilot ----
class CopilotContext(BaseModel):
    """Compact snapshot of seed state sent from frontend so the model is grounded."""
    model_config = ConfigDict(extra="ignore")
    stats: Optional[Dict[str, Any]] = None
    athletes: Optional[List[Dict[str, Any]]] = None
    injuries: Optional[List[Dict[str, Any]]] = None
    alerts: Optional[List[Dict[str, Any]]] = None


class CopilotRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    message: str
    session_id: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = None  # [{role, content}, ...] for one-shot context
    context: Optional[CopilotContext] = None


def build_system_prompt(context: Optional[CopilotContext]) -> str:
    base = (
        "You are the AMS Copilot, the conversational AI inside the Unified Sports Interface (USI) "
        "Athlete Management System. You assist sports federation staff — coaches, performance "
        "directors, physiotherapists, sports scientists — with concise, data-aware answers.\n\n"
        "Style rules:\n"
        "- Be concise. 2–5 short sentences for most answers. Use **bold** for key numbers or names.\n"
        "- Always ground answers in the data snapshot below. Cite athlete IDs (e.g., SPR-014).\n"
        "- If asked about something outside the data, say so briefly and offer an adjacent insight.\n"
        "- Never invent injuries, dates, or athletes that are not present.\n"
        "- Sentence case. No emoji.\n\n"
        "Focal scenario you should know cold:\n"
        "Arjun Sharma (SPR-014), 22, 100m sprinter, Sprint A squad. Coach Meera Iyer, physio Dr Rao. "
        "Currently rehabbing a grade 2 right-hamstring strain. AI flagged elevated risk 4 days before "
        "injury (ACWR 1.52, 78% confidence). Currently on day 14, RTP stage 3 (Rehab). Eccentric "
        "strength at 78% of left-leg baseline (target 90%). HRV recovered to 56 ms, sleep back to 7.5 h. "
        "Estimated RTP window: 8–12 days.\n"
    )
    if context is None:
        return base

    ctx_lines = ["\n--- Current data snapshot ---"]
    if context.stats:
        ctx_lines.append(f"Squad stats: {json.dumps(context.stats)}")
    if context.athletes:
        # trim athletes to essentials
        slim = [
            {
                "id": a.get("id"),
                "name": a.get("name"),
                "event": a.get("event"),
                "squad": a.get("squad"),
                "status": a.get("status"),
                "readiness": a.get("readiness"),
                "acwr": a.get("acwr"),
            }
            for a in context.athletes
        ]
        ctx_lines.append(f"Athletes ({len(slim)}): {json.dumps(slim)}")
    if context.injuries:
        ctx_lines.append(f"Active injuries: {json.dumps(context.injuries)}")
    if context.alerts:
        ctx_lines.append(f"Active alerts: {json.dumps(context.alerts)}")
    return base + "\n" + "\n".join(ctx_lines)


@api_router.post("/copilot/chat")
async def copilot_chat(req: CopilotRequest):
    """Streams Claude Sonnet 4.5 responses as SSE."""
    if not EMERGENT_LLM_KEY:
        raise HTTPException(status_code=500, detail="EMERGENT_LLM_KEY not configured")

    system_prompt = build_system_prompt(req.context)
    session_id = req.session_id or str(uuid.uuid4())

    # Compose user-facing message. Keep prior turns out of the user message itself
    # (transcript-style framing makes Claude continue with a fake follow-up).
    full_message = req.message
    if req.history:
        # short prior turns appended ONLY to system prompt so the model has context
        recent = req.history[-4:]
        history_block = "\n".join(
            [f"- {h.get('role', 'user').capitalize()}: {h.get('content', '')[:240]}" for h in recent]
        )
        system_prompt = (
            system_prompt
            + "\n\nRecent conversation (for context only — do NOT continue or imitate a transcript, only answer the next user message):\n"
            + history_block
        )

    async def event_generator():
        try:
            chat = LlmChat(
                api_key=EMERGENT_LLM_KEY,
                session_id=session_id,
                system_message=system_prompt,
            ).with_model("anthropic", "claude-sonnet-4-5-20250929")

            user_msg = UserMessage(text=full_message)
            async for event in chat.stream_message(user_msg):
                if isinstance(event, TextDelta):
                    # SSE token frame
                    payload = json.dumps({"type": "token", "content": event.content})
                    yield f"data: {payload}\n\n"
                elif isinstance(event, StreamDone):
                    yield f"data: {json.dumps({'type': 'done'})}\n\n"
                    break
        except Exception as e:
            logger.exception("Copilot stream failed")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no", "Connection": "keep-alive"},
    )


# ---- existing routes ----
@api_router.get("/")
async def root():
    return {"message": "Hello World"}


@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj


@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
