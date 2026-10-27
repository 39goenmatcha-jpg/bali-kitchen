import '@testing-library/jest-dom'

// Web Speech API mock for jsdom
const mockSpeak = vi.fn()
const mockCancel = vi.fn()
global.SpeechSynthesisUtterance = class {
  constructor(text) { this.text = text; this.lang = ''; this.onend = null; this.onerror = null }
}
global.window.speechSynthesis = { speak: mockSpeak, cancel: mockCancel }
