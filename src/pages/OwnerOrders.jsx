import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useOrders } from '../hooks/useOrders.js'
import { useInventory } from '../hooks/useInventory.js'
import { CsvImporter } from '../components/CsvImporter.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

const CHANNEL_LABELS = {
  shopee: 'Shopee', tokopedia: 'Tokopedia', tiktok: 'TikTok',
  grab: 'Grab', gojek: 'Gojek', cafe: 'Cafe', direct: '直販',
}
const DIRECT_CHANNELS = ['grab', 'gojek', 'cafe', 'direct']

const EMPTY_FORM = {
  source: 'grab', buyerName: '', buyerAddress: '', buyerPhone: '',
  productId: '', qty: 1,
}

export default function OwnerOrders() {
  const { language } = useAuth()
  const t = language === 'ja' ? ja : idStrings
  const { orders, loading } = useOrders()
  const { items: inventoryItems } = useInventory()
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  async function handleManualSubmit(e) {
    e.preventDefault()
    const product = inventoryItems.find(i => i.id === form.productId)
    if (!product) return
    setSaving(true)
    await addDoc(collection(db, 'orders'), {
      source: form.source,
      requiresLabel: false,
      status: 'pending',
      buyerName: form.buyerName,
      buyerAddress: form.buyerAddress,
      buyerPhone: form.buyerPhone,
      items: [{ productId: form.productId, name: product.name, qty: Number(form.qty), price: 0 }],
      createdAt: serverTimestamp(),
    })
    setForm(EMPTY_FORM)
    setSaving(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/dashboard" className="text-green-600 hover:underline text-sm">← {t.dashboard}</Link>
          <h1 className="text-lg font-bold text-gray-800">{t.orders}</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* CSVインポート */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t.importCsv}</h2>
          <CsvImporter />
        </div>

        {/* 直販/Grab/Gojek 手動入力 */}
        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">{t.manualEntry}</h2>
          <form onSubmit={handleManualSubmit} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">{t.source}</label>
              <select
                value={form.source}
                onChange={e => setForm(f => ({ ...f, source: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
              >
                {DIRECT_CHANNELS.map(ch => (
                  <option key={ch} value={ch}>{CHANNEL_LABELS[ch]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">{t.buyer}</label>
              <input
                value={form.buyerName}
                onChange={e => setForm(f => ({ ...f, buyerName: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t.address}</label>
              <input
                value={form.buyerAddress}
                onChange={e => setForm(f => ({ ...f, buyerAddress: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t.phone}</label>
              <input
                value={form.buyerPhone}
                onChange={e => setForm(f => ({ ...f, buyerPhone: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">{t.product}</label>
              <select
                value={form.productId}
                onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                required
              >
                <option value="">-- 選択 --</option>
                {inventoryItems.map(item => (
                  <option key={item.id} value={item.id}>{item.name} (残{item.stock})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500">{t.quantity}</label>
              <input
                type="number" min="1" value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                className="w-full border rounded px-2 py-1 text-sm mt-1"
                required
              />
            </div>
            <div className="col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : t.save}
              </button>
            </div>
          </form>
        </div>

        {/* 注文一覧 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b">
            <h2 className="text-sm font-semibold text-gray-700">{t.orderList}</h2>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400">読み込み中...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">注文なし</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-3 py-2 text-gray-600">{t.source}</th>
                  <th className="text-left px-3 py-2 text-gray-600">{t.buyer}</th>
                  <th className="text-left px-3 py-2 text-gray-600">{t.status}</th>
                  <th className="text-left px-3 py-2 text-gray-600">送り状</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="border-t hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                        {CHANNEL_LABELS[order.source] ?? order.source}
                      </span>
                    </td>
                    <td className="px-3 py-2">{order.buyerName}</td>
                    <td className="px-3 py-2">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'printed' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {t[order.status] ?? order.status}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      {order.requiresLabel && order.status !== 'delivered' && (
                        <Link
                          to={`/orders/${order.id}/label`}
                          className="text-xs text-green-600 hover:underline"
                        >
                          {order.status === 'printed' ? t.reprintLabel : t.printLabel}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  )
}
