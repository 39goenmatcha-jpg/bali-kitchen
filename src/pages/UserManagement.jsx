import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

export default function UserManagement() {
  const { language } = useAuth()
  const t = language === 'ja' ? ja : idStrings
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ email: '', password: '', role: 'staff' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function loadUsers() {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  useEffect(() => { loadUsers() }, [])

  async function handleInvite(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const cred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: form.email,
        role: form.role,
        language: 'ja',
      })
      setForm({ email: '', password: '', role: 'staff' })
      await loadUsers()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(uid) {
    if (!window.confirm('このユーザーを削除しますか？')) return
    await deleteDoc(doc(db, 'users', uid))
    await loadUsers()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/settings" className="text-green-600 hover:underline text-sm">← {t.settings}</Link>
          <h1 className="text-lg font-bold text-gray-800">{t.users}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ユーザー招待フォーム */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">ユーザーを招待</h2>
          <form onSubmit={handleInvite} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="text-xs text-gray-500">Email</label>
              <input
                type="email" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="block border rounded px-2 py-1 text-sm mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">パスワード</label>
              <input
                type="password" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="block border rounded px-2 py-1 text-sm mt-1"
                minLength={8} required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">ロール</label>
              <select
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="block border rounded px-2 py-1 text-sm mt-1"
              >
                <option value="staff">Staff</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-4 py-1.5 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? '...' : '招待'}
            </button>
          </form>
          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
        </div>

        {/* ユーザー一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2 text-gray-600">Email</th>
                <th className="text-left px-4 py-2 text-gray-600">ロール</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t">
                  <td className="px-4 py-2">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      u.role === 'owner' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleDelete(u.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      削除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
