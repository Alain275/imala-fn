import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Icon3D } from "@/components/icon-3d"
import { sendChatMessage } from "@/services/chat"
import type { ChatMessage } from "@/types/chat"
import { authService } from "@/services/auth"
import {
  Bot,
  Send,
  Sparkles,
  Leaf,
  CloudRain,
  Bug,
  Droplets,
  Sprout,
  User,
} from "lucide-react"

const publicQuestions = [
  { icon: Leaf, text: "What crops grow well in Musanze this season?", hint: "Location-based crop choice" },
  { icon: CloudRain, text: "When should I plant maize if rain starts this week?", hint: "Planting timing" },
  { icon: Droplets, text: "How much fertilizer should I use for beans?", hint: "Input planning" },
  { icon: Bug, text: "How do I prevent disease before planting potatoes?", hint: "Crop health" },
]

const farmerQuestions = [
  { icon: Leaf, text: "What should I do next on my farm?", hint: "Next farm action" },
  { icon: CloudRain, text: "Am I on schedule with my farm plan?", hint: "Plan progress" },
  { icon: Droplets, text: "What should I prepare before my next activity?", hint: "Inputs and preparation" },
  { icon: Bug, text: "What risks should I watch for in my crop?", hint: "Crop protection" },
]

export default function AIPage() {
  const isPublic = !authService.isAuthenticated()
  const suggestedQuestions = isPublic ? publicQuestions : farmerQuestions
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage, { role: "assistant", content: "" }])
    setInput("")
    setIsLoading(true)

    abortControllerRef.current = new AbortController()

    try {
      await sendChatMessage(
        [...messages, userMessage],
        (char) => {
          setMessages((prev) => {
            const updated = [...prev]
            const last = updated[updated.length - 1]
            if (last && last.role === "assistant") {
              last.content += char
            }
            return updated
          })
        },
        abortControllerRef.current.signal
      )
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setMessages((prev) => {
          const updated = [...prev]
          const last = updated[updated.length - 1]
          if (last && last.role === "assistant") {
            last.content = error.message || "Sorry, I could not get crop advice right now. Please try again."
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (isPublic) {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <Header
          title="AI Crop Advisory"
          subtitle="Get practical guidance for Irish potatoes, maize, and beans"
        />

        <main className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col p-3 sm:p-6">
          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border bg-card shadow-sm">
            {messages.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
                  <Sprout className="h-7 w-7" />
                </span>
                <h2 className="text-xl font-semibold text-foreground">Ask IMARA about your crops</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Ask a farming question and receive clear, location-aware crop advice.
                </p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm ${message.role === "user" ? "bg-emerald-600 text-white" : "bg-muted text-foreground"}`}>
                      {message.content || "Thinking…"}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}

            <div className="border-t bg-background/70 p-3 sm:p-4">
              <div className="flex gap-2">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Ask a question about your crop..."
                  className="h-11 flex-1"
                  disabled={isLoading}
                />
                <Button onClick={handleSend} disabled={!input.trim() || isLoading} className="h-11 gap-2 bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4" />
                  <span className="hidden sm:inline">{isLoading ? "Sending" : "Send"}</span>
                </Button>
              </div>
            </div>
          </section>
        </main>
      </div>
    )
  }

  return (
    <div className={isPublic ? "flex h-full min-h-0 flex-col overflow-hidden" : "min-h-screen flex flex-col"}>
      <Header
        title="AI Crop Advisory"
        subtitle={isPublic
          ? "Ask about Irish potatoes, maize, or beans"
          : "Ask about your crops, farmer profile, and saved farm plans"}
      />

      <div className={`mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col p-3 sm:p-6 ${isPublic ? "overflow-hidden" : ""}`}>
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className={`max-w-2xl text-center ${isPublic ? "space-y-3" : "space-y-6"}`}>
              <div className="flex justify-center">
                <div className="relative">
                  <Icon3D gradient="leaf" size="xl">
                    <Bot className="w-12 h-12" />
                  </Icon3D>
                  <Sparkles className="absolute -right-1 -top-1 w-6 h-6 text-yellow-500 animate-pulse" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {isPublic ? "Ask IMARA AI for crop advice" : "Ask about your farm"}
                </h2>
                <p className="text-muted-foreground">
                  {isPublic
                    ? "Get simple guidance for Irish potatoes, maize, and beans."
                    : "IMARA uses your farmer profile and farm plans to give you relevant answers."}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Try asking for advice:</p>
                <div className={`grid grid-cols-1 gap-2 ${isPublic ? "sm:grid-cols-2" : "md:grid-cols-2"}`}>
                  {suggestedQuestions.map((question) => (
                    <Button
                      key={question.text}
                      variant="outline"
                      className="justify-start text-left h-auto py-3 px-4"
                      onClick={() => setInput(question.text)}
                    >
                      <question.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                      <div className="text-sm">
                        <div>{question.text}</div>
                        <div className="text-xs text-muted-foreground">{question.hint}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <p className={`${isPublic ? "hidden" : ""} text-xs text-muted-foreground`}>
                You can ask in English or Kinyarwanda.
              </p>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex-1 space-y-4 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}
                >
                  {msg.content ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      {msg.content.split("\n").map((line, i) => {
                        if (!line.trim()) return <br key={i} />
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <p key={i} className="font-bold mb-2">{line.replace(/\*\*/g, "")}</p>
                        }
                        if (line.trim().startsWith("-")) {
                          return <p key={i} className="ml-4 mb-1">{line}</p>
                        }
                        return <p key={i} className="mb-1">{line}</p>
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                      <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                    </div>
                  )}
                </div>

                {msg.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={`shrink-0 border-t bg-background ${isPublic ? "pt-2" : "sticky bottom-0 pt-4"}`}>
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isPublic
                ? "Ask about Irish potatoes, maize, or beans..."
                : "Ask a question about your farm..."}
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              {isLoading ? "..." : "Send"}
            </Button>
          </div>
          <p className={`${isPublic ? "hidden" : ""} text-xs text-muted-foreground mt-2 text-center`}>
            IMARA AI gives crop advisory guidance. Confirm high-risk decisions with a local agronomist.
          </p>
        </div>
      </div>
    </div>
  )
}
