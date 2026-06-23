// IMPORTANT: No AI provider API key (OpenAI, Anthropic, Gemini, etc.) belongs here
// or in any VITE_ env var. Anything in the frontend bundle is public.
// The key lives on the backend only. This file only talks to OUR backend /api/chat.
// To switch to real mode: set USE_MOCK_CHAT = false.

import type { ChatMessage } from "@/types/chat";

const USE_MOCK_CHAT = true;

const MOCK_DELAY_MS = 550;
const MOCK_CHAR_DELAY_MS = 16;

function getMockReply(messages: ChatMessage[]): string {
  const last = [...messages].reverse().find((m) => m.role === "user");
  const q = last?.content.toLowerCase() ?? "";

  if (q.includes("crop") || q.includes("advisory") || q.includes("plant") || q.includes("seed")) {
    return "IMARA's Crop Advisory gives you personalized planting calendars, soil-matched seed recommendations, and step-by-step cultivation guides based on your specific location and crop type across Rwanda.";
  }
  if (q.includes("disease") || q.includes("pest") || q.includes("sick") || q.includes("detect")) {
    return "IMARA's Disease Detection uses AI-powered image analysis to identify crop diseases and pests from photos you take in the field. You get an instant diagnosis and treatment recommendations from certified agronomists.";
  }
  if (q.includes("weather") || q.includes("rain") || q.includes("forecast") || q.includes("climate")) {
    return "IMARA's Weather Intelligence delivers hyper-local forecasts, rainfall predictions, and weather-based planting alerts tailored to your farm's GPS location — so you always know the best time to plant, irrigate, or harvest.";
  }
  if (q.includes("market") || q.includes("price") || q.includes("sell") || q.includes("profit")) {
    return "IMARA's Market Prices feature shows real-time crop prices from local markets across all 30 districts of Rwanda, so you can sell at the right time and get the best value for your harvest.";
  }
  if (q.includes("agronomist") || q.includes("expert") || q.includes("consult")) {
    return "IMARA connects you directly with over 200 certified agronomists across Rwanda. You can ask questions, share field photos, and get expert guidance — all through the app, in Kinyarwanda, English, or French.";
  }
  if (q.includes("register") || q.includes("sign up") || q.includes("start") || q.includes("join") || q.includes("get started")) {
    return "Getting started with IMARA is easy! Click 'Get Started Free' at the top of the page, create your farmer profile with your location and crops, and you'll receive your first personalized recommendations within minutes.";
  }
  if (q.includes("free") || q.includes("cost") || q.includes("pay") || q.includes("subscription")) {
    return "IMARA offers a free tier for individual farmers covering core features — crop advisories, weather alerts, and disease detection. Premium plans unlock unlimited expert consultations and advanced analytics.";
  }
  if (q.includes("language") || q.includes("kinyarwanda") || q.includes("french") || q.includes("english")) {
    return "IMARA supports Kinyarwanda, English, and French. You can switch languages at any time from the top navigation bar — making it accessible to farmers across all of Rwanda's regions.";
  }

  return "IMARA is Rwanda's leading agricultural intelligence platform, supporting over 50,000 farmers across 30 districts. I can tell you about our crop advisory system, AI disease detection, weather intelligence, market prices, or how to get started — just ask!";
}

export async function sendChatMessage(
  messages: ChatMessage[],
  onToken: (char: string) => void,
  signal?: AbortSignal
): Promise<void> {
  if (USE_MOCK_CHAT) {
    const reply = getMockReply(messages);
    await new Promise<void>((res) => setTimeout(res, MOCK_DELAY_MS));
    if (signal?.aborted) return;

    for (const char of reply) {
      if (signal?.aborted) return;
      onToken(char);
      await new Promise<void>((res) => setTimeout(res, MOCK_CHAR_DELAY_MS));
    }
    return;
  }

  // TODO: replace with real POST /api/chat (backend holds the AI key — never put it here)
  // The dev proxy in vite.config.ts forwards /api/* to the backend, so no absolute URL needed in dev.
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
    signal,
  });

  if (!res.ok) throw new Error(`Chat request failed: ${res.status}`);

  const reader = res.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) throw new Error("No response body");

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (signal?.aborted) { reader.cancel(); return; }
    for (const char of decoder.decode(value, { stream: true })) {
      onToken(char);
    }
  }
}
