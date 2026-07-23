import { useEffect, useRef, useState } from "react"
import { useTheme } from "next-themes"
import {
  Bot,
  Bug,
  CloudRain,
  Droplets,
  Leaf,
  Menu,
  Mic,
  Moon,
  Plus,
  Search,
  Send,
  Sparkles,
  Sun,
  Thermometer,
  User,
  Wind,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { LanguageSwitcher } from "@/components/LanguageSwitcher"
import { NotificationsBell } from "@/components/NotificationsBell"
import { CommandCenterSidebar } from "@/components/CommandCenterSidebar"
import { CommandCenterMobileNav } from "@/components/CommandCenterMobileNav"
import { sendChatMessage } from "@/services/chat"
import type { ChatMessage } from "@/types/chat"
import { authService } from "@/services/auth"
import { useCurrentWeather } from "@/hooks/useWeather"

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
  const { resolvedTheme, setTheme } = useTheme()
  const isPublic = !authService.isAuthenticated()
  const suggestions = isPublic ? publicQuestions : farmerQuestions
  const location = localStorage.getItem("imara_weather_location") || authService.getCurrentUser()?.location || "Musanze"
  const latitude = localStorage.getItem("imara_weather_lat")
  const longitude = localStorage.getItem("imara_weather_lon")
  const weatherQuery = latitude && longitude
    ? { location, lat: Number(latitude), lon: Number(longitude) }
    : location
  const { data: weather } = useCurrentWeather(weatherQuery)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeMounted, setThemeMounted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => setThemeMounted(true), [])
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages])
  useEffect(() => () => abortControllerRef.current?.abort(), [])

  const handleSend = async (prompt = input) => {
    const content = prompt.trim()
    if (!content || isLoading) return
    const userMessage: ChatMessage = { role: "user", content }
    setMessages((previous) => [...previous, userMessage, { role: "assistant", content: "" }])
    setInput("")
    setIsLoading(true)
    abortControllerRef.current = new AbortController()

    try {
      await sendChatMessage(
        [...messages, userMessage],
        (character) => {
          setMessages((previous) => {
            const updated = [...previous]
            const last = updated[updated.length - 1]
            if (last?.role === "assistant") updated[updated.length - 1] = { ...last, content: last.content + character }
            return updated
          })
        },
        abortControllerRef.current.signal
      )
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setMessages((previous) => {
          const updated = [...previous]
          const last = updated[updated.length - 1]
          if (last?.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: error.message || "Sorry, I could not get crop advice right now. Please try again.",
            }
          }
          return updated
        })
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }

  return (
    <div className="advisory-shell h-screen overflow-hidden bg-[#eef8f1] text-[#17231b] dark:bg-[#101a14] dark:text-[#edf5ef]">
      <style>{`
        .advisory-shell { position: relative; width: 100%; height: 100vh; overflow: hidden; }
        .advisory-sidebar {
          position: fixed; inset: 0 auto 0 0; z-index: 50; display: flex; width: 280px;
          flex-direction: column; background: #2e4d3d; color: white; transform: translateX(0);
        }
        .advisory-content { display: flex; height: 100%; min-width: 0; margin-left: 280px; flex-direction: column; }
        .advisory-header {
          display: flex; height: 48px; flex: 0 0 48px; align-items: center;
          border-bottom: 1px solid #dce9df; background: rgba(255,255,255,.82); padding: 0 28px;
        }
        .advisory-layout {
          display: grid; width: 100%; max-width: 1180px; min-height: 0; flex: 1 1 auto;
          margin: 0 auto; grid-template-columns: minmax(0, 1fr) 330px; gap: 20px;
        }
        .dark .advisory-sidebar { background: #152a20; }
        .dark .advisory-header { border-color: #294033; background: rgba(16,26,20,.94); }
        .advisory-mobile-overlay, .advisory-menu-button, .advisory-mobile-close { display: none; }
        @media (max-width: 1199px) {
          .advisory-sidebar { width: 230px; }
          .advisory-content { margin-left: 230px; }
          .advisory-layout { grid-template-columns: minmax(0, 1fr) 280px; }
        }
        @media (max-width: 900px) {
          .advisory-layout { grid-template-columns: minmax(0, 1fr); }
          .advisory-context { display: none; }
        }
        @media (max-width: 767px) {
          .advisory-sidebar { width: 280px; transform: translateX(-100%); transition: transform 250ms ease; }
          .advisory-sidebar.is-open { transform: translateX(0); }
          .advisory-content { margin-left: 0; }
          .advisory-header { padding: 0 14px; }
          .advisory-mobile-overlay { position: fixed; inset: 0; z-index: 40; display: block; background: rgba(0,0,0,.5); }
          .advisory-menu-button { display: grid; width: 36px; height: 36px; place-items: center; }
          .advisory-mobile-close { position: fixed; right: 16px; top: 16px; z-index: 60; display: grid; color: white; }
        }
      `}</style>

      {mobileOpen && <button className="advisory-mobile-overlay" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <CommandCenterSidebar
        active="cropAdvisory"
        open={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        className="advisory-sidebar"
      />

      <div className="advisory-content">
        <header className="advisory-header">
          <button className="advisory-menu-button mr-2" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="min-w-0 flex-1 truncate text-[15px] font-bold"><span className="hidden sm:inline">Agri-Precision Command</span><span className="sm:hidden">IMARA</span></h1>
          <div className="mr-3 hidden h-full w-[220px] items-center border-x border-[#dce9df] px-3 md:flex dark:border-[#294033]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search telemetry…"
              className="h-full min-w-0 flex-1 bg-transparent pl-2 text-[10px] outline-none"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setInput(event.currentTarget.value)
                  inputRef.current?.focus()
                }
              }}
            />
          </div>
          <button
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {themeMounted && resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <NotificationsBell />
          <div className="hidden sm:block"><LanguageSwitcher /></div>
        </header>

        <main className="flex min-h-0 flex-1 overflow-hidden px-3 pb-20 pt-3 sm:p-5 md:pb-5">
          <div className="advisory-layout">
            <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[6px] border border-[#d7e5da] bg-white shadow-[0_10px_35px_rgba(35,72,50,.05)] dark:border-[#2b4235] dark:bg-[#17271e]">
              <div className="flex h-[58px] shrink-0 items-center border-b border-[#e1ebe3] px-5 dark:border-[#2b4235]">
                <div>
                  <h2 className="flex items-center gap-2 text-base font-medium">IMARA Advisory <span className="h-2 w-2 rounded-full bg-[#91eb2f]" /></h2>
                  <p className="mt-0.5 text-[9px] text-muted-foreground">Specialized Agronomy Model v4.2 · Connection secure</p>
                </div>
                <span className="ml-auto rounded-full bg-[#e9f4ea] px-3 py-1 text-[8px] font-bold text-[#386048] dark:bg-[#263b2e] dark:text-[#aee8bd]">Active session</span>
              </div>

              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto bg-[#f8fcf9] p-4 dark:bg-[#122018] sm:p-5">
                {messages.length === 0 && (
                  <>
                    <AssistantMessage>
                      <p>Good morning. I’m ready to analyze crop conditions for <strong>{location}</strong>.</p>
                      <p className="mt-2">Ask about crop selection, planting schedules, fertilizer, disease prevention, or your next field action.</p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="bg-[#edf5ee] px-2 py-1 text-[9px] dark:bg-[#263a2e]">Temperature: {Math.round(weather?.temperature ?? 22)}°C</span>
                        <span className="bg-[#edf5ee] px-2 py-1 text-[9px] dark:bg-[#263a2e]">Rain: {weather?.rainChance ?? 0}%</span>
                      </div>
                    </AssistantMessage>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion.text}
                          onClick={() => void handleSend(suggestion.text)}
                          className="flex items-start gap-3 border border-[#dce8df] bg-white p-3 text-left transition hover:border-[#91c856] hover:bg-[#f5faf6] dark:border-[#30473a] dark:bg-[#1a2b21] dark:hover:bg-[#20352a]"
                        >
                          <suggestion.icon className="mt-0.5 h-4 w-4 shrink-0 text-[#47734f]" />
                          <span>
                            <span className="block text-[10px] font-medium">{suggestion.text}</span>
                            <span className="mt-1 block text-[8px] text-muted-foreground">{suggestion.hint}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {messages.map((message, index) => (
                  message.role === "assistant"
                    ? <AssistantMessage key={index}>{message.content ? <FormattedMessage content={message.content} /> : <TypingDots />}</AssistantMessage>
                    : (
                      <div key={index} className="flex justify-end gap-2">
                        <div className="max-w-[78%] rounded-l-xl rounded-br-xl bg-[#dfece3] px-4 py-3 text-xs leading-5 dark:bg-[#294033]">{message.content}</div>
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#dfece3] dark:bg-[#294033]"><User className="h-3.5 w-3.5" /></span>
                      </div>
                    )
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0 border-t border-[#dce8df] bg-white p-3 dark:border-[#2b4235] dark:bg-[#17271e]">
                <div className="flex items-center gap-2 border border-[#d3e0d6] bg-[#fbfdfb] p-1.5 shadow-sm dark:border-[#31483a] dark:bg-[#132018]">
                  <button className="grid h-8 w-8 shrink-0 place-items-center text-muted-foreground" aria-label="Add context"><Plus className="h-4 w-4" /></button>
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" && !event.shiftKey) {
                        event.preventDefault()
                        void handleSend()
                      }
                    }}
                    placeholder="Ask IMARA about crops, actions, or projections…"
                    className="h-8 min-w-0 flex-1 bg-transparent text-xs outline-none"
                    disabled={isLoading}
                  />
                  <Mic className="h-4 w-4 text-muted-foreground" />
                  <Button
                    onClick={() => void handleSend()}
                    disabled={!input.trim() || isLoading}
                    className="h-8 w-9 rounded-sm bg-[#9bf52e] p-0 text-[#173020] hover:bg-[#adff46]"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="mt-2 text-center text-[8px] text-muted-foreground">IMARA can make mistakes. Verify critical actions against raw telemetry.</p>
              </div>
            </section>

            <aside className="advisory-context min-w-0 rounded-[6px] border border-[#d7e5da] bg-white p-5 shadow-[0_8px_30px_rgba(35,72,50,.04)] dark:border-[#2b4235] dark:bg-[#17271e]">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#49644f] dark:text-[#a5c1ad]">
                  <Sparkles className="h-3.5 w-3.5" /> Active context
                </h2>
                <span className="flex items-center gap-1 text-[8px] text-[#669241]"><span className="h-1.5 w-1.5 rounded-full bg-[#91eb2f]" /> Live</span>
              </div>
              <div className="mt-7">
                <p className="text-2xl font-semibold">{location}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Crop advisory · Current season</p>
              </div>

              <div className="relative mt-5 h-32 overflow-hidden border border-[#d9e5dc] bg-[#cad8cd] dark:border-[#31483a] dark:bg-[#263a2e]">
                <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(90deg,transparent_49%,rgba(255,255,255,.75)_50%,transparent_51%),linear-gradient(0deg,transparent_49%,rgba(255,255,255,.75)_50%,transparent_51%),radial-gradient(circle_at_28%_35%,#6f8d72_0_17%,transparent_18%),radial-gradient(circle_at_72%_64%,#668269_0_20%,transparent_21%)] [background-size:33%_100%,100%_34%,100%_100%,100%_100%]" />
                <span className="absolute bottom-2 left-2 bg-[#244332]/85 px-2 py-1 text-[8px] text-white">{location} sector</span>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <ContextMetric icon={Droplets} label="Rain chance" value={`${weather?.rainChance ?? 0}%`} />
                <ContextMetric icon={Thermometer} label="Temperature" value={`${Math.round(weather?.temperature ?? 22)}°C`} />
              </div>
              <div className="mt-3 border border-[#dce7df] p-4 dark:border-[#30473a]">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">Wind speed</span>
                  <Wind className="h-3.5 w-3.5 text-[#69816f]" />
                </div>
                <p className="mt-3 text-lg font-semibold">{weather?.windSpeed ?? 0} <span className="text-[9px] font-normal text-muted-foreground">km/h</span></p>
                <div className="mt-4 grid grid-cols-7 gap-1">
                  {[30, 42, 55, 60, 54, 48, 72].map((height, index) => (
                    <span key={index} className={`${index === 6 ? "bg-[#9bf52e]" : "bg-[#e5eee7] dark:bg-[#2a4033]"}`} style={{ height: `${height / 3}px` }} />
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {mobileOpen && <button className="advisory-mobile-close" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>}
      <CommandCenterMobileNav active="cropAdvisory" />
    </div>
  )
}

function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#163c22] text-[#9bf52e]"><Bot className="h-4 w-4" /></span>
      <div className="max-w-[82%] rounded-r-xl rounded-bl-xl border border-[#dfe9e1] bg-white px-4 py-3 text-xs leading-5 shadow-sm dark:border-[#30473a] dark:bg-[#1b2c22]">
        {children}
      </div>
    </div>
  )
}

function FormattedMessage({ content }: { content: string }) {
  return (
    <div>
      {content.split("\n").map((line, index) => line.trim()
        ? <p key={index} className="mb-1 last:mb-0">{line.replace(/\*\*/g, "")}</p>
        : <br key={index} />
      )}
    </div>
  )
}

function TypingDots() {
  return (
    <div className="flex h-5 items-center gap-1">
      {[0, 1, 2].map((item) => <span key={item} className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#50715a]" style={{ animationDelay: `${item * 150}ms` }} />)}
    </div>
  )
}

function ContextMetric({ icon: Icon, label, value }: { icon: typeof Droplets; label: string; value: string }) {
  return (
    <div className="border border-[#dce7df] p-3 dark:border-[#30473a]">
      <div className="flex items-center justify-between text-[#64806a]">
        <span className="text-[8px] font-semibold uppercase tracking-wide">{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <p className="mt-2 text-lg font-semibold">{value}</p>
    </div>
  )
}
