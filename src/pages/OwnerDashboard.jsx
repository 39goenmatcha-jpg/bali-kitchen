import React from 'react'
import { Link } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useInventory } from '../hooks/useInventory.js'
import { InventoryTable } from '../components/InventoryTable.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { AlarmBanner } from '../components/AlarmBanner.jsx'
import { ja } from '../i18n/ja.js'
import { id } from '../i18n/id.js'

export default function OwnerDashboard() {
  const { language } = useAuth()
  const { items, loading } = useInventory()
  const t = language === 'ja' ? ja : id

  return (
    <div className="min-h-screen bg-gray-50">
      <AlarmBanner />

      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-700">🍵 Bali Matcha</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <nav className="flex gap-2 text-sm">
              <Link to="/orders" className="text-green-600 hover:underline">{t.orders}</Link>
              <Link to="/settings" className="text-gray-500 hover:underline">{t.settings}</Link>
            </nav>
            <button onClick={() => signOut(auth)} className="text-xs text-gray-400 hover:text-gray-600">
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">{t.inventory}</h2>
          {loading && <span className="text-xs text-gray-400">更新中...</span>}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">読み込み中...</div>
          ) : (
            <InventoryTable items={items} />
          )}
        </div>
      </main>
    </div>
  )
}
