import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

const CHANNEL_BADGE = {
  stores:        { label: 'STORES',      cls: 'bg-blue-100 text-blue-700' },
  salon:         { label: 'サロン生',    cls: 'bg-purple-100 text-purple-700' },
  bsw:           { label: 'BSW生',       cls: 'bg-pink-100 text-pink-700' },
  center_south:  { label: 'センター南',  cls: 'bg-yellow-100 text-yellow-800' },
  center_north:  { label: 'センター北',  cls: 'bg-orange-100 text-orange-700' },
  seijo:         { label: '成城学園前',  cls: 'bg-green-100 text-green-700' },
}

export function OrderCard({ order, onCompleteDelivery, completing }) {
  const navigate = useNavigate()
  const { language } = useAuth() ?? { language: 'ja' }
  const t = language === 'ja' ? ja : idStrings

  const badge = CHANNEL_BADGE[order.source] ?? { label: order.source, cls: 'bg-gray-100 text-gray-600' }

  // requiresLabel=true かつ status=pending → 配送完了ボタン disabled
  const canComplete = !order.requiresLabel || order.status === 'printed' || order.status === 'delivered'
  const isDelivered = order.status === 'delivered'

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${badge.cls}`}>{badge.label}</span>
          <p className="mt-1 font-semibold text-gray-800">{order.buyerName}</p>
          {order.buyerAddress && <p className="text-xs text-gray-500">{order.buyerAddress}</p>}
        </div>
        <span className={`text-xs px-2 py-0.5 rounded ${
          isDelivered ? 'bg-green-100 text-green-700' :
          order.status === 'printed' ? 'bg-yellow-100 text-yellow-700' :
          'bg-gray-100 text-gray-600'
        }`}>
          {t[order.status] ?? order.status}
        </span>
      </div>

      {order.items?.map((item, i) => (
        <div key={i} className="text-sm text-gray-600">
          {item.name} × {item.qty}
        </div>
      ))}

      {!isDelivered && (
        <div className="flex gap-2 flex-wrap">
          {order.requiresLabel && (
            <button
              onClick={() => navigate(`/orders/${order.id}/label`)}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700"
            >
              {order.status === 'printed' ? t.reprintLabel : t.printLabel}
            </button>
          )}
          <button
            onClick={() => onCompleteDelivery?.(order.id)}
            disabled={!canComplete || completing}
            className="text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t.completeDelivery}
          </button>
        </div>
      )}
    </div>
  )
}
