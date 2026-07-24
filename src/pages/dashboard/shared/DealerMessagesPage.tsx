import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { MessageCircle, Send, Store, UserRound } from "lucide-react"

import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { authService } from "@/services/auth"
import {
  agroDealerMarketplaceService,
  type DealerConversation,
  type DealerMessage,
} from "@/services/agroDealerMarketplace.service"

export default function DealerMessagesPage() {
  const currentUser = authService.getCurrentUser()
  const [searchParams, setSearchParams] = useSearchParams()
  const [conversations, setConversations] = useState<DealerConversation[]>([])
  const [messages, setMessages] = useState<DealerMessage[]>([])
  const [draft, setDraft] = useState("")
  const [status, setStatus] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const selectedConversationId = searchParams.get("conversation")

  useEffect(() => {
    async function loadConversations() {
      try {
        const result = await agroDealerMarketplaceService.getConversations()
        setConversations(result)
        if (!selectedConversationId && result[0]) setSearchParams({ conversation: result[0].id }, { replace: true })
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load conversations")
      }
    }
    void loadConversations()
  }, [])

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) {
        setMessages([])
        return
      }
      try {
        setMessages(await agroDealerMarketplaceService.getMessages(selectedConversationId))
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load messages")
      }
    }
    void loadMessages()
  }, [selectedConversationId])

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId]
  )
  const counterpart = selectedConversation
    ? currentUser?.role === "agro-dealer"
      ? selectedConversation.farmer
      : currentUser?.role === "agronomist"
        ? selectedConversation.farmer
        : selectedConversation.agronomist || selectedConversation.agroDealer
    : null

  const conversationPerson = (conversation: DealerConversation) =>
    currentUser?.role === "agro-dealer"
      ? conversation.farmer
      : currentUser?.role === "agronomist"
        ? conversation.farmer
        : conversation.agronomist || conversation.agroDealer

  async function sendMessage() {
    if (!selectedConversationId || !draft.trim() || sending) return
    setSending(true)
    try {
      const sent = await agroDealerMarketplaceService.sendMessage(selectedConversationId, draft.trim())
      setMessages((previous) => [...previous, sent])
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === selectedConversationId
            ? { ...conversation, lastMessage: sent.content, lastMessageAt: sent.createdAt }
            : conversation
        )
      )
      setDraft("")
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send message")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="farmer-workspace-page">
      <Header title="Messages" subtitle="Keep product, delivery, and agronomy conversations in one place." />

      <main className="mx-auto max-w-7xl p-3 pb-28 sm:p-6 lg:p-8 lg:pb-8">
        {status && <div className="mb-4 border-l-2 border-[#d51f2c] bg-[#fff3f3] px-4 py-3 text-xs text-[#a81722]">{status}</div>}

        <section className="grid min-h-[calc(100vh-165px)] overflow-hidden border border-[#d7e5da] bg-white shadow-[0_8px_30px_rgba(35,72,50,.05)] lg:grid-cols-[320px_minmax(0,1fr)] dark:border-[#2b4235] dark:bg-[#17271e]">
          <aside className="border-b border-[#d7e5da] lg:border-b-0 lg:border-r dark:border-[#2b4235]">
            <div className="flex items-center justify-between border-b border-[#e3ece5] px-4 py-4 dark:border-[#2b4235]">
              <div>
                <h2 className="text-sm font-black text-[#21392b] dark:text-[#edf5ef]">Conversations</h2>
                <p className="mt-1 text-[9px] uppercase tracking-wide text-[#718176]">{conversations.length} active threads</p>
              </div>
              <span className="grid h-8 w-8 place-items-center bg-[#eaf7de] text-[#315900] dark:bg-[#29402f] dark:text-[#b5ff62]"><MessageCircle className="h-4 w-4" /></span>
            </div>

            <div className="flex max-h-44 gap-2 overflow-x-auto p-3 lg:max-h-[calc(100vh-240px)] lg:flex-col lg:overflow-y-auto">
              {conversations.map((conversation) => {
                const person = conversationPerson(conversation)
                const selected = selectedConversationId === conversation.id
                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSearchParams({ conversation: conversation.id })}
                    className={cn(
                      "min-w-[240px] border-l-2 p-3 text-left transition lg:min-w-0",
                      selected ? "border-[#8fe82e] bg-[#f1f9ea] dark:bg-[#24382c]" : "border-transparent hover:bg-[#f5f9f6] dark:hover:bg-[#203229]"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", selected ? "bg-[#315900] text-[#b5ff62]" : "bg-[#e4eee6] text-[#557160]")}>
                        {conversation.agronomist ? <UserRound className="h-4 w-4" /> : <Store className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-black text-[#294535] dark:text-[#edf5ef]">{person?.name || "Conversation"}</span>
                        <span className="mt-0.5 block truncate text-[9px] text-[#718176]">{conversation.topicName || conversation.product?.name || "General request"}</span>
                        <span className="mt-2 block truncate text-[10px] text-[#647b6b]">{conversation.lastMessage || "No messages yet"}</span>
                      </span>
                    </div>
                  </button>
                )
              })}
              {conversations.length === 0 && <p className="p-4 text-xs text-[#718176]">No conversations yet. Start one from Marketplace or Agronomists.</p>}
            </div>
          </aside>

          <div className="flex min-h-[520px] min-w-0 flex-col">
            <header className="flex min-h-16 items-center gap-3 border-b border-[#e3ece5] px-4 py-3 dark:border-[#2b4235] sm:px-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#153923] text-[#b5ff62]"><UserRound className="h-4 w-4" /></span>
              <div className="min-w-0">
                <h2 className="truncate text-sm font-black text-[#21392b] dark:text-[#edf5ef]">{counterpart?.name || "Select a conversation"}</h2>
                <p className="truncate text-[10px] text-[#718176]">
                  {selectedConversation?.topicName || selectedConversation?.product?.name || "Choose a conversation to begin"}
                  {counterpart?.location ? ` • ${counterpart.location}` : ""}
                </p>
              </div>
              {selectedConversationId && <span className="ml-auto hidden items-center gap-1.5 text-[8px] font-bold uppercase tracking-wide text-[#477326] sm:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#8fe82e]" /> Active</span>}
            </header>

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f4f9f5] p-4 dark:bg-[#101a14] sm:p-5">
              {messages.map((item) => {
                const mine = item.senderId === currentUser?.id
                return (
                  <div key={item.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[88%] px-4 py-3 text-xs leading-5 sm:max-w-[72%]", mine ? "bg-[#315900] text-white" : "border border-[#d7e5da] bg-white text-[#294535] dark:border-[#2b4235] dark:bg-[#17271e] dark:text-[#edf5ef]")}>
                      <p className={cn("mb-1 text-[9px] font-bold", mine ? "text-[#b5ff62]" : "text-[#718176]")}>{item.sender?.name || "User"}</p>
                      <p className="whitespace-pre-wrap">{item.content}</p>
                    </div>
                  </div>
                )
              })}
              {messages.length === 0 && (
                <div className="grid h-full min-h-72 place-items-center text-center">
                  <div><MessageCircle className="mx-auto h-9 w-9 text-[#8da093]" /><p className="mt-3 text-xs font-bold text-[#557160]">Select or start a conversation</p><p className="mt-1 text-[10px] text-[#718176]">Your messages will appear here.</p></div>
                </div>
              )}
            </div>

            <div className="border-t border-[#d7e5da] bg-white p-3 dark:border-[#2b4235] dark:bg-[#17271e] sm:p-4">
              <div className="flex items-end gap-2">
                <Textarea
                  placeholder="Write a message…"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage()
                    }
                  }}
                  disabled={!selectedConversationId}
                  className="min-h-11 resize-none"
                />
                <Button aria-label="Send message" onClick={sendMessage} disabled={!selectedConversationId || !draft.trim() || sending} className="h-11 bg-[#315900] px-4 text-[#b5ff62] hover:bg-[#254500]">
                  <Send className="h-4 w-4" /><span className="hidden sm:inline">Send</span>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
