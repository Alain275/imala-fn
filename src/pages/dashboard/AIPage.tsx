import { useState, useRef, useEffect } from "react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Icon3D } from "@/components/icon-3d"
import { sendChatMessage } from "@/services/chat"
import type { ChatMessage } from "@/types/chat"
import {
  Bot,
  Send,
  Sparkles,
  Leaf,
  CloudRain,
  Bug,
  Droplets,
  User,
} from "lucide-react"

const suggestedQuestions = [
  { icon: Leaf, text: "What crops grow well in Musanze this season?", hint: "Location-based crop choice" },
  { icon: CloudRain, text: "When should I plant maize if rain starts this week?", hint: "Planting timing" },
  { icon: Droplets, text: "How much fertilizer should I use for beans?", hint: "Input planning" },
  { icon: Bug, text: "How do I prevent disease before planting potatoes?", hint: "Crop health" },
]

export default function AIPage() {
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="AI Crop Advisory"
        subtitle="Ask IMARA AI what to plant, when to plant, how to fertilize, and how to respond to field conditions"
      />

      <div className="flex-1 flex flex-col p-4 sm:p-6 max-w-5xl mx-auto w-full">
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-6 max-w-2xl">
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
                  Ask IMARA AI for crop advice
                </h2>
                <p className="text-muted-foreground">
                  Farmers can use this public crop advisory without creating an account.
                </p>
              </div>

              <Card className="border-0 shadow-md bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-3 flex items-center justify-center gap-2 sm:justify-start">
                    <Sparkles className="w-5 h-5 text-emerald-600" />
                    I can help you decide:
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-left">
                    <div className="flex items-start gap-2">
                      <Leaf className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Crop choice:</strong> what fits your district, soil, and season
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CloudRain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Planting timing:</strong> when to plant, spray, irrigate, or harvest
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Bug className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Crop health:</strong> how to prevent pests, fungi, and nutrient stress
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <Droplets className="w-4 h-4 text-sky-600 mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <strong className="text-foreground">Input planning:</strong> fertilizer, water, spacing, and field tasks
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <p className="text-sm text-muted-foreground mb-3">Try asking for advice:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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

              <p className="text-xs text-muted-foreground">
                You can ask in English or Kinyarwanda.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
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

        <div className="sticky bottom-0 bg-background pt-4 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask for crop advice... e.g. What should I plant in Musanze this week?"
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
          <p className="text-xs text-muted-foreground mt-2 text-center">
            IMARA AI gives crop advisory guidance. Confirm high-risk decisions with a local agronomist.
          </p>
        </div>
      </div>
    </div>
  )
}
