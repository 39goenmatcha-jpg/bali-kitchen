import { renderHook, act } from '@testing-library/react'
import { useAnnouncement } from '../src/hooks/useAnnouncement'

it('speak()を呼ぶとisSpeakingがtrueになる', () => {
  const { result } = renderHook(() => useAnnouncement())
  act(() => result.current.speak('テスト'))
  expect(result.current.isSpeaking).toBe(true)
})

it('stop()を呼ぶとisSpeakingがfalseになる', () => {
  const { result } = renderHook(() => useAnnouncement())
  act(() => result.current.speak('テスト'))
  act(() => result.current.stop())
  expect(result.current.isSpeaking).toBe(false)
})
