import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { authService } from "@/services/auth";
import {
  agroDealerMarketplaceService,
  DealerConversation,
  DealerMessage,
} from "@/services/agroDealerMarketplace.service";

export default function DealerMessagesPage() {
  const currentUser = authService.getCurrentUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState<DealerConversation[]>([]);
  const [messages, setMessages] = useState<DealerMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const selectedConversationId = searchParams.get("conversation");

  useEffect(() => {
    async function loadConversations() {
      try {
        const result = await agroDealerMarketplaceService.getConversations();
        setConversations(result);
        if (!selectedConversationId && result[0]) {
          setSearchParams({ conversation: result[0].id });
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load conversations");
      }
    }

    loadConversations();
  }, []);

  useEffect(() => {
    async function loadMessages() {
      if (!selectedConversationId) return;
      try {
        const result = await agroDealerMarketplaceService.getMessages(selectedConversationId);
        setMessages(result);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load messages");
      }
    }

    loadMessages();
  }, [selectedConversationId]);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedConversationId),
    [conversations, selectedConversationId]
  );

  const counterpart = selectedConversation
    ? currentUser?.role === "agro-dealer"
      ? selectedConversation.farmer
      : currentUser?.role === "agronomist"
        ? selectedConversation.farmer
        : selectedConversation.agronomist || selectedConversation.agroDealer
    : null;

  async function sendMessage() {
    if (!selectedConversationId || !draft.trim()) return;
    try {
      const sent = await agroDealerMarketplaceService.sendMessage(selectedConversationId, draft.trim());
      setMessages((prev) => [...prev, sent]);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === selectedConversationId
            ? {
                ...conversation,
                lastMessage: sent.content,
                lastMessageAt: sent.createdAt,
              }
            : conversation
        )
      );
      setDraft("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Failed to send message");
    }
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Dealer Messages"
        subtitle="Talk directly between farmer and agro-dealer around a product or delivery need."
      />

      <div className="p-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Your active dealer and farmer chats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {conversations.map((conversation) => {
              const person =
                currentUser?.role === "agro-dealer" ? conversation.farmer : conversation.agroDealer;
              return (
                <button
                  key={conversation.id}
                  onClick={() => setSearchParams({ conversation: conversation.id })}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-colors",
                    selectedConversationId === conversation.id ? "border-emerald-500 bg-emerald-50" : "hover:bg-muted"
                  )}
                >
                  <p className="font-medium">{person?.name || "Conversation"}</p>
                  <p className="text-xs text-muted-foreground">{conversation.product?.name || "General request"}</p>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{conversation.lastMessage || "No messages yet."}</p>
                </button>
              );
            })}
            {conversations.length === 0 ? <p className="text-sm text-muted-foreground">{status || "No conversations yet."}</p> : null}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>{counterpart?.name || "Conversation"}</CardTitle>
            <CardDescription>
              {selectedConversation?.topicName || selectedConversation?.product?.name || "General discussion"}
              {counterpart?.location ? ` · ${counterpart.location}` : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="min-h-[360px] space-y-3 rounded-xl border bg-muted/30 p-4">
              {messages.map((message) => {
                const mine = message.senderId === currentUser?.id;
                return (
                  <div key={message.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                        mine ? "bg-emerald-600 text-white" : "bg-background border"
                      )}
                    >
                      <p className="font-medium text-xs mb-1 opacity-80">{message.sender?.name || "User"}</p>
                      <p>{message.content}</p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 ? <p className="text-sm text-muted-foreground">Select or start a conversation to begin messaging.</p> : null}
            </div>

            <div className="space-y-3">
              <Textarea
                placeholder="Write your message..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!selectedConversationId}
              />
              <div className="flex items-center gap-3">
                <Button onClick={sendMessage} disabled={!selectedConversationId || !draft.trim()}>
                  Send message
                </Button>
                {status && <p className="text-sm text-muted-foreground">{status}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
