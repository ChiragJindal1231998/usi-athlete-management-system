import { useState, useRef, useEffect } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardBody } from "@/components/shared/Card";
import { COPILOT_SUGGESTIONS, COPILOT_ANSWERS } from "@/data/seed";
import { Send, Sparkles, User2 } from "lucide-react";
import { motion } from "framer-motion";

function findAnswer(q) {
  const norm = q.trim().toLowerCase();
  // direct match first
  if (COPILOT_ANSWERS[norm]) return COPILOT_ANSWERS[norm];
  // fuzzy
  for (const k of Object.keys(COPILOT_ANSWERS)) {
    const keys = k.split(" ").filter((w) => w.length > 3);
    if (keys.filter((w) => norm.includes(w)).length >= Math.ceil(keys.length / 2)) {
      return COPILOT_ANSWERS[k];
    }
  }
  // graceful fallback that still references seed data
  return "Based on current data, no exact match — but here's what I see: 12 athletes on roster, 9 available, 3 in rehab. Arjun Sharma (SPR-014) is the most critical case this week. Ask me about a specific athlete, ACWR, or readiness for a deeper answer.";
}

export default function AICopilot() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text:
        "Hi — I'm the AMS copilot. I have access to all athlete, training, medical, and wellness data. Ask me anything about your squad. Try one of the suggestions, or type your own question.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  const send = (text) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((p) => [...p, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages((p) => [...p, { role: "assistant", text: findAnswer(q) }]);
      setThinking(false);
    }, 850);
  };

  return (
    <div data-testid="copilot-page">
      <PageHeader
        title="AI copilot"
        subtitle="Conversational layer · sits over training, medical and wellness data"
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
                  {m.role === "assistant" ? <Sparkles className="h-4 w-4" /> : <User2 className="h-4 w-4" />}
                </div>
                <div className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${m.role === "assistant" ? "border border-slate-200 bg-white text-slate-700" : "bg-[#1E40AF] text-white"}`}>
                  <FormattedText text={m.text} />
                </div>
              </motion.div>
            ))}
            {thinking && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-start gap-3"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EFF6FF] text-[#1E40AF] ring-1 ring-[#1E40AF]/20">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                </div>
                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                </div>
              </motion.div>
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
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <button
                data-testid="copilot-send"
                onClick={() => send()}
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1E40AF] text-white transition-opacity hover:bg-[#1E3A8A] disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-slate-400">
              Answers are generated from the prototype's seeded data — production model would query live feeds.
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
                className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-700 transition-colors hover:border-[#1E40AF]/30 hover:bg-[#EFF6FF]"
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
  // very light markdown: **bold**
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
