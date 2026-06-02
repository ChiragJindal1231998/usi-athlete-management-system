import { useState, useRef, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardBody } from "@/components/shared/Card";
import { COPILOT_SUGGESTIONS } from "@/data/seed";
import { Send, Sparkles, User2, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function sessionId() {
  let id = sessionStorage.getItem("ams-copilot-sid");
  if (!id) {
    id = "sid-" + Math.random().toString(36).slice(2, 12);
    sessionStorage.setItem("ams-copilot-sid", id);
  }
  return id;
}

export default function AICopilot() {
  const { stats, athletes, injuries, alerts } = useApp();
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi — I'm the AMS copilot, powered by Claude Sonnet 4.5 and grounded on live squad data. Ask me anything about your athletes, training load, readiness or injuries.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const buildContext = () => ({
    stats,
    athletes,
    injuries,
    alerts: alerts.filter((a) => a.status === "active"),
  });

  const buildHistory = () =>
    messages
      .filter((m) => m.text && !m.streaming)
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.text }));

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || streaming) return;

    setError(null);
    setMessages((p) => [...p, { role: "user", text: q }]);
    setInput("");
    setStreaming(true);

    // placeholder assistant message we'll stream into
    setMessages((p) => [...p, { role: "assistant", text: "", streaming: true }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API}/copilot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: q,
          session_id: sessionId(),
          history: buildHistory(),
          context: buildContext(),
        }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) throw new Error(`Request failed (${res.status})`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // parse SSE frames separated by \n\n
        let nl;
        while ((nl = buffer.indexOf("\n\n")) >= 0) {
          const frame = buffer.slice(0, nl).trim();
          buffer = buffer.slice(nl + 2);
          if (!frame.startsWith("data:")) continue;
          const json = frame.slice(5).trim();
          try {
            const evt = JSON.parse(json);
            if (evt.type === "token") {
              assistantText += evt.content;
              setMessages((p) => {
                const copy = [...p];
                copy[copy.length - 1] = { role: "assistant", text: assistantText, streaming: true };
                return copy;
              });
            } else if (evt.type === "error") {
              throw new Error(evt.message || "Stream error");
            } else if (evt.type === "done") {
              // handled by stream end
            }
          } catch {
            // ignore malformed frames
          }
        }
      }

      setMessages((p) => {
        const copy = [...p];
        copy[copy.length - 1] = { role: "assistant", text: assistantText || "(no response)" };
        return copy;
      });
    } catch (e) {
      if (e.name !== "AbortError") {
        setError(e.message || "Connection failed");
        setMessages((p) => {
          const copy = [...p];
          // remove the empty streaming placeholder
          if (copy[copy.length - 1]?.streaming) copy.pop();
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  return (
    <div data-testid="copilot-page">
      <PageHeader
        title="AI copilot"
        subtitle="Live answers from Claude Sonnet 4.5, grounded on your current squad data"
        action={
          <div className="flex items-center gap-2 rounded-lg border border-[#1E40AF]/20 bg-[#EFF6FF] px-3 py-1.5 text-xs">
            <span className="ai-pulse-dot h-1.5 w-1.5 rounded-full bg-[#1E40AF]" />
            <span className="font-medium text-[#1E40AF]">claude-sonnet-4.5 · live</span>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-4">
        <Card className="col-span-8 flex h-[640px] flex-col">
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-6">
            {messages.map((m, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
                className={`flex items-start gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                data-testid={`msg-${idx}`}
              >
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.role === "assistant" ? "bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#1E40AF]/20" : "bg-slate-100 text-slate-700"}`}>
                  {m.role === "assistant" ? <Sparkles className={`h-4 w-4 ${m.streaming ? "animate-pulse" : ""}`} /> : <User2 className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "border border-slate-200 bg-white text-slate-700" : "bg-[#1E40AF] text-white"}`}>
                  {m.text ? <FormattedText text={m.text} /> : <StreamDots />}
                  {m.streaming && m.text && <span className="ml-0.5 inline-block h-3 w-1.5 animate-pulse bg-[#1E40AF]/40" />}
                </div>
              </motion.div>
            ))}
            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-[#DC2626]/30 bg-[#FECACA]/40 p-3 text-xs text-[#991B1B]">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                <div>
                  <p className="font-medium">Copilot is unreachable.</p>
                  <p>{error}</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 p-4">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 transition-shadow focus-within:shadow-sm focus-within:ring-2 focus-within:ring-[#1E40AF]/20">
              <input
                data-testid="copilot-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask about athletes, training load, readiness, injuries…"
                disabled={streaming}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                data-testid="copilot-send"
                onClick={() => send()}
                disabled={!input.trim() || streaming}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E40AF] text-white transition-opacity hover:bg-[#1E3A8A] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-slate-400">
              Claude Sonnet 4.5 is grounded on the current snapshot of athletes, injuries and alerts.
            </p>
          </div>
        </Card>

        <Card className="col-span-4 h-fit">
          <CardBody className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Suggested questions</p>
            {COPILOT_SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                data-testid={`suggest-${i}`}
                onClick={() => send(s)}
                disabled={streaming}
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-700 transition-colors hover:border-[#1E40AF]/30 hover:bg-[#EFF6FF] disabled:opacity-50"
              >
                {s}
              </button>
            ))}
            <div className="mt-4 rounded-lg border border-[#1E40AF]/15 bg-[#EFF6FF] p-3 text-xs text-slate-700">
              <p className="font-semibold text-[#1E40AF]">Reactive vs proactive AI</p>
              <p className="mt-1">
                Copilot is the reactive layer — staff ask, it answers. Proactive AI runs in the background, producing the injury predictions and load alerts surfaced on the dashboard, training and medical screens.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function FormattedText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
}

function StreamDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
    </span>
  );
}
