import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { useNavigate } from 'react-router-dom'
import { auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id } from '../i18n/id.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [lang, setLang] = useState('ja')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { role } = useAuth()
  const t = lang === 'ja' ? ja : id

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
      // AuthContextがroleを更新したらApp.jsxのRootRedirectが振り分け
    } catch {
      setError(lang === 'ja' ? 'メールアドレスまたはパスワードが間違っています' : 'Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-md w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-green-700">🍵 Bali Matcha</h1>
          <p className="text-gray-500 text-sm mt-1">在庫管理 / Manajemen Stok</p>
        </div>

        {/* 言語切替 */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setLang('ja')}
            className={`px-3 py-1 rounded text-sm font-medium ${lang === 'ja' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            日本語
          </button>
          <button
            onClick={() => setLang('id')}
            className={`px-3 py-1 rounded text-sm font-medium ${lang === 'id' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            Indonesia
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {lang === 'ja' ? 'パスワード' : 'Kata Sandi'}
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? '...' : t.login}
          </button>
        </form>
      </div>
    </div>
  )
}
