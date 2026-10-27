import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useAuth } from './AuthContext.jsx'
import { useAnnouncement } from '../hooks/useAnnouncement.js'
import { ja } from '../i18n/ja.js'
import { id as idStrings } from '../i18n/id.js'

const AlarmContext = createContext(null)
const REPEAT_INTERVAL_MS = 30_000

export function AlarmProvider({ children }) {
  const [alarms, setAlarms] = useState([])
  const { language } = useAuth() ?? { language: 'ja' }
  const { speak, stop } = useAnnouncement()
  const intervalRef = useRef(null)
  const languageRef = useRef(language)

  useEffect(() => { languageRef.current = language }, [language])

  // /notifications を購読し acknowledged=false のものを alarms に追加
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      const active = snapshot.docs
        .filter(d => !d.data().acknowledged)
        .map(d => ({ docId: d.id, ...d.data() }))
      setAlarms(active)
    })
    return unsubscribe
  }, [])

  // alarms が変わったらアナウンスを30秒ごとに繰り返す
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (alarms.length === 0) {
      stop()
      return
    }

    const announce = () => {
      const t = languageRef.current === 'ja' ? ja : idStrings
      const text = alarms
        .map(a => t.lowStockAnnouncement.replace('{name}', a.name).replace('{stock}', a.stock))
        .join('。')
      speak(text, languageRef.current)
    }

    announce()
    intervalRef.current = setInterval(announce, REPEAT_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [alarms])

  const stopAlarm = async (productId) => {
    const alarm = alarms.find(a => a.productId === productId)
    if (alarm?.docId) {
      await updateDoc(doc(db, 'notifications', alarm.docId), { acknowledged: true })
    }
    setAlarms(prev => prev.filter(a => a.productId !== productId))
  }

  return (
    <AlarmContext.Provider value={{ alarms, stopAlarm }}>
      {children}
    </AlarmContext.Provider>
  )
}

export function useAlarm() {
  return useContext(AlarmContext)
}
