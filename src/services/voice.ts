import { buildApiUrl } from "./api"

async function voiceRequest<T>(path: string, init: RequestInit): Promise<T> {
  const token = localStorage.getItem("token")
  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    throw new Error(payload?.message || `Voice request failed: ${response.status}`)
  }
  return payload.data as T
}

export async function transcribeKinyarwanda(audio: Blob): Promise<string> {
  const form = new FormData()
  const extension = audio.type.includes("ogg") ? "ogg" : audio.type.includes("mp4") ? "m4a" : "webm"
  form.append("audio", audio, `recording.${extension}`)

  const data = await voiceRequest<{ transcript: string }>("/voice/transcribe", {
    method: "POST",
    body: form,
  })
  return data.transcript
}

export async function synthesizeKinyarwanda(text: string): Promise<string> {
  const data = await voiceRequest<{ audioUrl: string }>("/voice/synthesize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  })
  return data.audioUrl
}
