import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id } from '../i18n/id.js'

export function InventoryTable({ items }) {
  const { language } = useAuth()
  const t = language === 'ja' ? ja : id

  if (!items || items.length === 0) {
    return <p className="text-gray-500 text-sm">データなし</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left px-3 py-2 border-b font-medium text-gray-600">{language === 'ja' ? '商品名' : 'Produk'}</th>
            <th className="text-right px-3 py-2 border-b font-medium text-gray-600">{t.stockRemaining}</th>
            <th className="text-right px-3 py-2 border-b font-medium text-gray-600">{t.threshold}</th>
            <th className="text-left px-3 py-2 border-b font-medium text-gray-600">{t.lastUpdated}</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const isLow = typeof item.stock === 'number' && typeof item.threshold === 'number'
              && item.stock <= item.threshold
            return (
              <tr key={item.id} className={isLow ? 'bg-red-50' : 'hover:bg-gray-50'}>
                <td className="px-3 py-2 border-b">
                  {isLow && <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2" />}
                  {item.name}
                </td>
                <td className={`text-right px-3 py-2 border-b font-bold ${isLow ? 'text-red-600' : 'text-gray-800'}`}>
                  {item.stock ?? '-'}
                </td>
                <td className="text-right px-3 py-2 border-b text-gray-500">
                  {item.threshold ?? 20}
                </td>
                <td className="px-3 py-2 border-b text-gray-400 text-xs">
                  {item.lastUpdated?.toDate?.()?.toLocaleString('ja-JP') ?? '-'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
