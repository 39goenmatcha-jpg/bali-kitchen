import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db, getMessagingInstance } from '../firebase.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [role, setRole] = useState(null)
  const [language, setLanguageState] = useState('ja')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists()) {
          const data = snap.data()
          setRole(data.role || 'staff')
          setLanguageState(data.language || 'ja')
        }
        // FCMトークン登録（失敗しても続行）
        try {
          const messaging = await getMessagingInstance()
          if (messaging) {
            const { getToken } = await import('firebase/messaging')
            const vapidKey = import.meta.env?.VITE_FIREBASE_VAPID_KEY
            if (vapidKey && vapidKey !== 'REPLACE_ME') {
              const token = await getToken(messaging, { vapidKey })
              if (token) {
                await setDoc(doc(db, 'users', user.uid), { fcmToken: token }, { merge: true })
              }
            }
          }
        } catch {
          // 通知権限が拒否されてもアプリ内アラームは動作する
        }
      } else {
        setRole(null)
      }
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const setLanguage = async (lang) => {
    setLanguageState(lang)
    if (currentUser) {
      await setDoc(doc(db, 'users', currentUser.uid), { language: lang }, { merge: true })
    }
  }

  return (
    <AuthContext.Provider value={{ currentUser, role, language, setLanguage, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
