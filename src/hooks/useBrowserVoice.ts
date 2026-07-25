import { useCallback, useEffect, useRef, useState } from "react"
import { synthesizeKinyarwanda, transcribeKinyarwanda } from "@/services/voice"

type RecognitionResultEvent = {
  results: ArrayLike<{
    0: { transcript: string }
    isFinal: boolean
  }>
}

type RecognitionErrorEvent = {
  error: string
}

type BrowserSpeechRecognition = {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: RecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

type SpeechWindow = Window & {
  SpeechRecognition?: BrowserSpeechRecognitionConstructor
  webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
}

interface ListenCallbacks {
  onInterim: (transcript: string) => void
  onFinal: (transcript: string) => void
}

const recognitionErrorMessages: Record<string, string> = {
  "audio-capture": "No microphone was found.",
  "language-not-supported": "Voice recognition is not available for the selected language on this device.",
  network: "Voice recognition needs a working internet connection on this browser.",
  "no-speech": "I could not hear any speech. Please try again.",
  "not-allowed": "Microphone access was blocked. Allow microphone access and try again.",
  "service-not-allowed": "Voice recognition is not available in this browser.",
}

export function useBrowserVoice(language: string) {
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const recordingStreamRef = useRef<MediaStream | null>(null)
  const recordingTimeoutRef = useRef<number | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [lastAudioUrl, setLastAudioUrl] = useState("")
  const [error, setError] = useState("")
  const isKinyarwanda = language.toLowerCase().startsWith("rw")

  const browserRecognitionSupported = typeof window !== "undefined" &&
    Boolean((window as SpeechWindow).SpeechRecognition || (window as SpeechWindow).webkitSpeechRecognition)
  const recordingSupported = typeof navigator !== "undefined" &&
    Boolean(navigator.mediaDevices?.getUserMedia) &&
    typeof MediaRecorder !== "undefined"
  const recognitionSupported = isKinyarwanda ? recordingSupported : browserRecognitionSupported
  const speechSupported = isKinyarwanda || (typeof window !== "undefined" && "speechSynthesis" in window)

  const stopListening = useCallback(() => {
    if (recordingTimeoutRef.current) {
      window.clearTimeout(recordingTimeoutRef.current)
      recordingTimeoutRef.current = null
    }
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    recognitionRef.current?.stop()
    setIsListening(false)
  }, [])

  const startListening = useCallback((callbacks: ListenCallbacks) => {
    if (isKinyarwanda) {
      setError("")
      if (!recordingSupported) {
        setError("Audio recording is not supported in this browser. Try Chrome or Edge.")
        return
      }

      void navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg", "audio/mp4"]
          .find((type) => MediaRecorder.isTypeSupported(type))
        const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
        const chunks: Blob[] = []

        recordingStreamRef.current = stream
        recorderRef.current = recorder
        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) chunks.push(event.data)
        }
        recorder.onerror = () => {
          setError("The recording could not be completed. Please try again.")
          setIsListening(false)
        }
        recorder.onstop = () => {
          if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current)
          recordingTimeoutRef.current = null
          stream.getTracks().forEach((track) => track.stop())
          recordingStreamRef.current = null
          recorderRef.current = null
          setIsListening(false)

          const audio = new Blob(chunks, { type: recorder.mimeType || "audio/webm" })
          if (!audio.size) {
            setError("No audio was recorded. Please try again.")
            return
          }

          setIsTranscribing(true)
          void transcribeKinyarwanda(audio)
            .then((transcript) => {
              callbacks.onInterim(transcript)
              callbacks.onFinal(transcript)
            })
            .catch((requestError) => {
              setError(requestError instanceof Error ? requestError.message : "Kinyarwanda transcription failed.")
            })
            .finally(() => setIsTranscribing(false))
        }

        setIsListening(true)
        recorder.start()
        recordingTimeoutRef.current = window.setTimeout(() => {
          if (recorder.state === "recording") recorder.stop()
        }, 45_000)
      }).catch((permissionError) => {
        setError(
          permissionError instanceof DOMException && permissionError.name === "NotAllowedError"
            ? "Microphone access was blocked. Allow microphone access and try again."
            : "The microphone could not be opened. Please try again."
        )
        setIsListening(false)
      })
      return
    }

    const speechWindow = window as SpeechWindow
    const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition

    setError("")
    if (!Recognition) {
      setError("Voice input is not supported in this browser. Try Chrome or Edge, or type your question.")
      return
    }

    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
    recognitionRef.current?.abort()

    const recognition = new Recognition()
    recognition.lang = language
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let transcript = ""
      let hasFinalResult = false

      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? ""
        hasFinalResult ||= event.results[index].isFinal
      }

      const normalizedTranscript = transcript.trim()
      if (!normalizedTranscript) return

      callbacks.onInterim(normalizedTranscript)
      if (hasFinalResult) callbacks.onFinal(normalizedTranscript)
    }

    recognition.onerror = (event) => {
      setError(recognitionErrorMessages[event.error] || "Voice recognition failed. Please try again.")
      setIsListening(false)
    }
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    setIsListening(true)
    recognition.start()
  }, [isKinyarwanda, language, recordingSupported])

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause()
    if (audioRef.current) audioRef.current.currentTime = 0
    audioRef.current = null
    if ("speechSynthesis" in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }, [])

  const speak = useCallback((text: string) => {
    const cleanText = text.replace(/\*\*/g, "").trim()
    if (!speechSupported || !cleanText) return

    if (isKinyarwanda) {
      stopSpeaking()
      setError("")
      setIsSpeaking(true)
      void synthesizeKinyarwanda(cleanText)
        .then((audioUrl) => {
          setLastAudioUrl(audioUrl)
          const audio = new Audio(audioUrl)
          audioRef.current = audio
          audio.onended = () => {
            audioRef.current = null
            setIsSpeaking(false)
          }
          audio.onerror = () => {
            audioRef.current = null
            setIsSpeaking(false)
            setError("The Kinyarwanda voice response could not be played.")
          }
          return audio.play()
        })
        .catch((requestError) => {
          audioRef.current = null
          setIsSpeaking(false)
          setError(
            requestError instanceof Error
              ? requestError.message
              : "The Kinyarwanda voice response could not be generated."
          )
        })
      return
    }

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(cleanText)
    utterance.lang = language
    utterance.rate = 0.95
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => {
      setIsSpeaking(false)
      setError("This device could not play the voice response. You can still read the answer.")
    }
    window.speechSynthesis.speak(utterance)
  }, [isKinyarwanda, language, speechSupported, stopSpeaking])

  useEffect(() => () => {
    recognitionRef.current?.abort()
    if (recorderRef.current?.state === "recording") recorderRef.current.stop()
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop())
    if (recordingTimeoutRef.current) window.clearTimeout(recordingTimeoutRef.current)
    audioRef.current?.pause()
    window.speechSynthesis?.cancel()
  }, [])

  return {
    error,
    isListening,
    isTranscribing,
    isSpeaking,
    lastAudioUrl,
    recognitionSupported,
    speechSupported,
    speak,
    startListening,
    stopListening,
    stopSpeaking,
  }
}
