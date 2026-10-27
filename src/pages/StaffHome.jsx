import React, { useState } from 'react'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { signOut } from 'firebase/auth'
import { auth } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useOrders } from '../hooks/useOrders.js'
import { OrderCard } from '../components/OrderCard.jsx'
import { AlarmBanner } from '../components/AlarmBanner.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

export default function StaffHome() {
  const { language } = useAuth()
  const t = language === 'ja' ? ja : idStrings
  const { orders, loading } = useOrders()
  const [completing, setCompleting] = useState(null)

  const activeOrders = orders.filter(o => o.status !== 'delivered')

  async function handleCompleteDelivery(orderId) {
    if (completing) return
    setCompleting(orderId)
    try {
      const completeDelivery = httpsCallable(getFunctions(), 'completeDelivery')
      await completeDelivery({ orderId })
    } catch (err) {
      console.error('completeDelivery error:', err)
    } finally {
      setCompleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AlarmBanner />

      <header className="bg-white shadow-sm">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-green-700">🌿 GOOEN酵素</h1>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <button onClick={() => signOut(auth)} className="text-xs text-gray-400 hover:text-gray-600">
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        <h2 className="text-base font-bold text-gray-800 mb-4">{t.orders}</h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8">読み込み中...</div>
        ) : activeOrders.length === 0 ? (
          <div className="text-center text-gray-400 py-8">未処理の注文はありません</div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onCompleteDelivery={handleCompleteDelivery}
                completing={completing === order.id}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
