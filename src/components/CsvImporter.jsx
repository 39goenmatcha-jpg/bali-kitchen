import React, { useRef, useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

// --- 純粋パーサー関数 ---

function parseCsvRows(csv) {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []
  const headers = lines[0].split(',').map(h => h.trim())
  return lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim())
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']))
  })
}

export function parseStoresCSV(csv) {
  return parseCsvRows(csv).map(row => ({
    source: 'stores',
    requiresLabel: true,
    status: 'pending',
    buyerName: row['お名前'] || row['購入者名'] || '',
    buyerAddress: row['お届け先住所'] || row['住所'] || '',
    buyerPhone: row['電話番号'] || '',
    items: [{
      name: row['商品名'] || '',
      qty: Number(row['数量'] || 1),
      price: Number(row['販売価格'] || row['単価'] || 0),
    }],
    externalOrderId: row['注文番号'] || '',
  }))
}

const PARSERS = {
  stores: parseStoresCSV,
}

// --- コンポーネント ---

export function CsvImporter({ onImported }) {
  const { language } = useAuth() ?? { language: 'ja' }
  const t = language === 'ja' ? ja : idStrings
  const [source, setSource] = useState('shopee')
  const [status, setStatus] = useState('')
  const fileRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    const parser = PARSERS[source]
    const orders = parser(text)
    if (orders.length === 0) { setStatus('データなし'); return }
    try {
      await Promise.all(orders.map(order =>
        addDoc(collection(db, 'orders'), { ...order, createdAt: serverTimestamp() })
      ))
      setStatus(`${orders.length}件インポート完了`)
      onImported?.()
    } catch {
      setStatus('エラーが発生しました')
    }
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={source}
        onChange={e => setSource(e.target.value)}
        className="border rounded px-2 py-1 text-sm"
      >
        <option value="stores">STORES</option>
      </select>
      <label className="cursor-pointer bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">
        {t.importCsv}
        <input ref={fileRef} type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
      </label>
      {status && <span className="text-xs text-gray-500">{status}</span>}
    </div>
  )
}
