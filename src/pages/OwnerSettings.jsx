import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useInventory } from '../hooks/useInventory.js'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

export default function OwnerSettings() {
  const { language } = useAuth()
  const t = language === 'ja' ? ja : idStrings
  const { items, loading } = useInventory()
  const [saving, setSaving] = useState({})

  async function handleThresholdSave(itemId, value) {
    setSaving(s => ({ ...s, [itemId]: true }))
    await updateDoc(doc(db, 'inventory', itemId), { threshold: Number(value) })
    setSaving(s => ({ ...s, [itemId]: false }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-green-600 hover:underline text-sm">← {t.dashboard}</Link>
            <h1 className="text-lg font-bold text-gray-800">{t.settings}</h1>
          </div>
          <Link to="/settings/users" className="text-sm text-green-600 hover:underline">{t.users}</Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">{t.threshold}</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">読み込み中...</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-2 text-gray-600">商品名</th>
                  <th className="text-right px-4 py-2 text-gray-600">在庫数</th>
                  <th className="text-center px-4 py-2 text-gray-600">{t.threshold}</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <ThresholdRow
                    key={item.id}
                    item={item}
                    saving={!!saving[item.id]}
                    onSave={handleThresholdSave}
                    t={t}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}

function ThresholdRow({ item, saving, onSave, t }) {
  const [value, setValue] = useState(item.threshold ?? 20)

  return (
    <tr className="border-t">
      <td className="px-4 py-2">{item.name}</td>
      <td className="text-right px-4 py-2 font-semibold">{item.stock ?? '-'}</td>
      <td className="px-4 py-2">
        <input
          type="number" min="0" value={value}
          onChange={e => setValue(e.target.value)}
          className="w-16 border rounded px-2 py-1 text-center text-sm"
        />
      </td>
      <td className="px-4 py-2">
        <button
          onClick={() => onSave(item.id, value)}
          disabled={saving}
          className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {saving ? '...' : t.save}
        </button>
      </td>
    </tr>
  )
}
