import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Firestoreをモック
vi.mock('../src/firebase.js', () => ({
  db: {},
  auth: { onAuthStateChanged: vi.fn(() => vi.fn()) },
  storage: {},
  getMessagingInstance: vi.fn().mockResolvedValue(null),
}))

const mockItems = [
  { id: 'rai-10g', name: '抹茶 来RAI 10g', stock: 18, threshold: 20, lastUpdated: null },
  { id: 'bi-20g', name: '抹茶 美BI 20g', stock: 0, threshold: 20, lastUpdated: null },
]

vi.mock('firebase/firestore', () => {
  let _callback = null
  return {
    collection: vi.fn(),
    onSnapshot: vi.fn((ref, callback) => {
      _callback = callback
      // 初回スナップショットを即座に発火
      callback({
        docs: mockItems.map(item => ({
          id: item.id,
          data: () => item,
        }))
      })
      return vi.fn() // unsubscribe
    }),
  }
})

import { useInventory } from '../src/hooks/useInventory.js'

describe('useInventory', () => {
  it('Firestoreのinventoryコレクションをリアルタイム購読してitemsを返す', async () => {
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.items).toHaveLength(2)
    expect(result.current.items[0].id).toBe('rai-10g')
    expect(result.current.items[0].stock).toBe(18)
  })

  it('在庫がthreshold以下のアイテムを識別できる', async () => {
    const { result } = renderHook(() => useInventory())
    await waitFor(() => expect(result.current.loading).toBe(false))
    const lowItems = result.current.items.filter(i => i.stock <= i.threshold)
    expect(lowItems).toHaveLength(2) // 18<=20, 0<=20 両方が対象
  })
})
