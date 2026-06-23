import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, RotateCcw, Leaf } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { sendChatMessage } from "@/services/chat"
import type { ChatMessage } from "@/types/chat"

const STARTER_QUESTIONS = [
  "How does IMARA's crop advisory work?",
  "Can IMARA detect crop diseases from photos?",
  "How do I get started with IMARA?",
]

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      abortRef.current?.abort()
    }
  }, [open])

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim()
      if (!trimmed || streaming) return

      const userMsg: ChatMessage = { role: "user", content: trimmed }
      const history = [...messages, userMsg]

      setMessages([...history, { role: "assistant", content: "" }])
      setInput("")
      setError(null)
      setStreaming(true)

      if (inputRef.current) inputRef.current.style.height = "auto"

      const assistantIdx = history.length
      const controller = new AbortController()
      abortRef.current = controller

      try {
        await sendChatMessage(
          history,
          (char) => {
            setMessages((prev) => {
              const next = [...prev]
              next[assistantIdx] = {
                role: "assistant",
                content: next[assistantIdx].content + char,
              }
              return next
            })
          },
          controller.signal
        )
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) => prev.slice(0, -1))
          setError("Something went wrong. Please try again.")
        }
      } finally {
        setStreaming(false)
      }
    },
    [messages, streaming]
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = e.target
    ta.style.height = "auto"
    ta.style.height = `${Math.min(ta.scrollHeight, 128)}px`
  }

  const retry = () => {
    setError(null)
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (lastUser) sendMessage(lastUser.content)
  }

  return (
    <>
      {open && (
        <div
          className={cn(
            "fixed bottom-[4.5rem] right-4 sm:right-6 z-50",
            "w-[min(calc(100vw-2rem),380px)]",
            "bg-card text-card-foreground border border-border",
            "rounded-xl shadow-2xl flex flex-col overflow-hidden",
            "max-h-[min(520px,calc(100dvh-6rem))]",
            "animate-in slide-in-from-bottom-4 fade-in duration-200"
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gradient-to-r from-emerald-600 to-green-600 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm leading-tight">IMARA Assistant</p>
              <p className="text-white/70 text-xs">Ask me anything about IMARA</p>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="text-white/80 hover:text-white hover:bg-white/20 shrink-0"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-2 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground text-sm">Hi! I'm your IMARA guide.</p>
                  <p className="text-sm text-muted-foreground leading-snug">
                    Ask me anything about how IMARA helps farmers across Rwanda.
                  </p>
                </div>
                <div className="flex flex-col gap-2 w-full text-left">
                  {STARTER_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className={cn(
                        "text-sm rounded-lg border border-border px-3 py-2 text-left",
                        "hover:bg-accent hover:text-accent-foreground",
                        "transition-colors duration-150"
                      )}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed break-words",
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted text-foreground rounded-bl-sm"
                    )}
                  >
                    {msg.content ? (
                      msg.content
                    ) : (
                      <span className="inline-flex items-center gap-1 h-4">
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:0ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:300ms]" />
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}

            {error && (
              <div className="flex flex-col gap-2 items-start pt-1">
                <p className="text-xs text-destructive">{error}</p>
                <Button size="sm" variant="outline" onClick={retry} className="gap-1.5 h-7 text-xs">
                  <RotateCcw className="w-3 h-3" />
                  Retry
                </Button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t border-border shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about IMARA…"
                disabled={streaming}
                className={cn(
                  "flex-1 resize-none rounded-lg border border-input bg-background",
                  "px-3 py-2 text-sm placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "min-h-9 max-h-32 overflow-y-auto"
                )}
              />
              <Button
                size="icon"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || streaming}
                aria-label="Send message"
                className="shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 select-none">
              Enter to send · Shift+Enter for newline
            </p>
          </div>
        </div>
      )}

      {/* Outer div carries the bounce; button handles hover:scale so transforms don't conflict */}
      <div className={cn("fixed bottom-4 right-4 sm:right-6 z-50", !open && "animate-bounce")}>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close IMARA chat" : "Chat with IMARA assistant"}
          className={cn(
            "relative w-14 h-14 rounded-full overflow-hidden",
            "bg-gradient-to-br from-emerald-500 to-green-600",
            "flex items-center justify-center shadow-lg",
            "transition-all duration-200 hover:scale-110 hover:shadow-xl",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          {/* Chatbot image — visible when panel is closed */}
          <img
            src="/chatbot.jpg"
            alt=""
            aria-hidden
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-all duration-200",
              open ? "opacity-0 scale-75" : "opacity-100 scale-100"
            )}
          />
          {/* X icon — visible when panel is open */}
          <X
            className={cn(
              "relative z-10 w-6 h-6 text-white transition-all duration-200",
              open ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          />
        </button>
      </div>
    </>
  )
}
