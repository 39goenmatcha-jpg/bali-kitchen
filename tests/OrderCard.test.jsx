import { vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../src/firebase.js', () => ({
  db: {},
  auth: { onAuthStateChanged: vi.fn(() => vi.fn()) },
  storage: {},
  getMessagingInstance: vi.fn().mockResolvedValue(null),
}))
vi.mock('../src/context/AuthContext.jsx', () => ({
  useAuth: () => ({ language: 'ja', currentUser: null, role: null }),
}))

import { OrderCard } from '../src/components/OrderCard'

function wrap(ui) {
  return render(<MemoryRouter>{ui}</MemoryRouter>)
}

it('requiresLabel=trueの注文は印刷ボタンを表示する', () => {
  const order = { id: '1', source: 'shopee', requiresLabel: true, status: 'pending', buyerName: '山田' }
  wrap(<OrderCard order={order} />)
  expect(screen.getByText(/送り状を印刷/)).toBeInTheDocument()
})

it('requiresLabel=falseの注文は配送完了ボタンを即座に表示する', () => {
  const order = { id: '2', source: 'grab', requiresLabel: false, status: 'pending', buyerName: '田中' }
  wrap(<OrderCard order={order} />)
  expect(screen.getByText(/配送完了/)).not.toBeDisabled()
})

it('requiresLabel=trueで未印刷の注文は配送完了ボタンがdisabled', () => {
  const order = { id: '3', source: 'shopee', requiresLabel: true, status: 'pending', buyerName: '鈴木' }
  wrap(<OrderCard order={order} />)
  expect(screen.getByText(/配送完了/)).toBeDisabled()
})

it('requiresLabel=trueで印刷済み（printed）の注文は配送完了ボタンがenabled', () => {
  const order = { id: '4', source: 'shopee', requiresLabel: true, status: 'printed', buyerName: '佐藤' }
  wrap(<OrderCard order={order} />)
  expect(screen.getByText(/配送完了/)).not.toBeDisabled()
})
