import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import React from 'react'

// Firebase Authをモック（実際のFirebaseプロジェクトなしでテスト可能にする）
vi.mock('../src/firebase.js', () => ({
  auth: {
    onAuthStateChanged: vi.fn(),
    currentUser: null,
  },
  db: {},
  storage: {},
  getMessagingInstance: vi.fn().mockResolvedValue(null),
}))

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((auth, callback) => {
    callback(null) // 未ログイン状態
    return vi.fn() // unsubscribe
  }),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn().mockResolvedValue({ exists: () => false, data: () => ({}) }),
  setDoc: vi.fn(),
}))

import { AuthProvider, useAuth } from '../src/context/AuthContext.jsx'

function TestComponent() {
  const { currentUser, role, language } = useAuth()
  return (
    <div>
      <span data-testid="user">{currentUser ? 'logged-in' : 'logged-out'}</span>
      <span data-testid="role">{role || 'none'}</span>
      <span data-testid="lang">{language}</span>
    </div>
  )
}

describe('AuthContext', () => {
  it('未ログイン時はcurrentUserがnull、languageはja', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      )
    })
    expect(screen.getByTestId('user').textContent).toBe('logged-out')
    expect(screen.getByTestId('lang').textContent).toBe('ja')
  })
})
