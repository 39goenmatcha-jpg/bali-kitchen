import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

// TODO: Firebase ConsoleでWebアプリを登録し、以下を実際の値に置き換える
// https://console.firebase.google.com/ → プロジェクト設定 → アプリ → CDN設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'REPLACE_ME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'REPLACE_ME',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'REPLACE_ME',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'REPLACE_ME',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_ME',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'REPLACE_ME',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// messaging はブラウザ環境でのみ使用可能
export const getMessagingInstance = async () => {
  const supported = await isSupported()
  if (supported) return getMessaging(app)
  return null
}
