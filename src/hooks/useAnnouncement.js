import { useState } from 'react'

const LANG_MAP = { ja: 'ja-JP', id: 'id-ID' }

export function useAnnouncement() {
  const [isSpeaking, setIsSpeaking] = useState(false)

  function speak(text, lang = 'ja') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = LANG_MAP[lang] ?? 'ja-JP'
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
    setIsSpeaking(true)
  }

  function stop() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  return { speak, stop, isSpeaking }
}
