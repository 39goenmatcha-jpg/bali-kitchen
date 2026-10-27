import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getFunctions, httpsCallable } from 'firebase/functions'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

export default function OrderLabel() {
  const { id: orderId } = useParams()
  const navigate = useNavigate()
  const { language } = useAuth()
  const t = language === 'ja' ? ja : idStrings
  const [labelUrl, setLabelUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const printed = useRef(false)

  useEffect(() => {
    async function fetchLabel() {
      try {
        const generateLabel = httpsCallable(getFunctions(), 'generateLabel')
        const res = await generateLabel({ orderId })
        setLabelUrl(res.data.labelUrl)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchLabel()
  }, [orderId])

  async function handlePrint() {
    window.print()
    if (!printed.current) {
      printed.current = true
      await updateDoc(doc(db, 'orders', orderId), { status: 'printed' })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm print:hidden">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-green-600 hover:underline"
          >
            ← {t.cancel}
          </button>
          <h1 className="text-base font-bold text-gray-800">{t.printLabel}</h1>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-4 py-6">
        {loading && <div className="text-center text-gray-400 py-8">PDF生成中...</div>}
        {error && <div className="text-red-500 py-4">{error}</div>}
        {labelUrl && (
          <>
            <iframe
              src={labelUrl}
              title="Shipping Label"
              className="w-full h-[500px] border rounded-xl shadow-sm"
            />
            <div className="mt-4 flex gap-3 print:hidden">
              <button
                onClick={handlePrint}
                className="bg-green-600 text-white px-6 py-2 rounded text-sm hover:bg-green-700"
              >
                {t.printLabel}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-100 text-gray-700 px-6 py-2 rounded text-sm hover:bg-gray-200"
              >
                {t.cancel}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
