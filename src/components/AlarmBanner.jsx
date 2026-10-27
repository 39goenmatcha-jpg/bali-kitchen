import React from 'react'
import { useAlarm } from '../context/AlarmContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

export function AlarmBanner() {
  const { alarms, stopAlarm } = useAlarm()
  const { language } = useAuth() ?? { language: 'ja' }
  const t = language === 'ja' ? ja : idStrings

  if (!alarms || alarms.length === 0) return null

  return (
    <div className="bg-red-600 text-white px-4 py-3 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <p className="font-bold text-sm mb-1">⚠ {t.alarmTitle}</p>
        {alarms.map(alarm => (
          <div key={alarm.productId} className="flex items-center justify-between py-1">
            <span className="text-sm">
              {t.lowStockAnnouncement
                .replace('{name}', alarm.name)
                .replace('{stock}', alarm.stock)}
            </span>
            <button
              onClick={() => stopAlarm(alarm.productId)}
              className="ml-4 text-xs bg-white text-red-600 px-2 py-1 rounded hover:bg-red-50"
            >
              {t.stopAlarm}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
