import React from 'react'
import { useAuth } from '../context/AuthContext.jsx'

export function LanguageToggle() {
  const { language, setLanguage } = useAuth()

  return (
    <div className="flex gap-1">
      <button
        onClick={() => setLanguage('ja')}
        className={`px-2 py-1 rounded text-xs font-medium ${language === 'ja' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        JA
      </button>
      <button
        onClick={() => setLanguage('id')}
        className={`px-2 py-1 rounded text-xs font-medium ${language === 'id' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
      >
        ID
      </button>
    </div>
  )
}
