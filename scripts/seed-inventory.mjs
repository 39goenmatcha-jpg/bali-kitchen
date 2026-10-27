// Firestoreに酵素ドリンク在庫マスタを登録するスクリプト
// 実行方法: node scripts/seed-inventory.mjs
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// サービスアカウントキーを探す（functions/serviceAccount.json or 環境変数）
let credential
const saPath = resolve(__dirname, '../functions/serviceAccount.json')
try {
  const sa = JSON.parse(readFileSync(saPath, 'utf8'))
  credential = cert(sa)
  console.log('✅ サービスアカウントキーを使用:', saPath)
} catch {
  console.log('⚠ serviceAccount.json なし → Application Default Credentials を使用')
  console.log('  （firebase CLI でログイン済みであれば動作します）')
  const { applicationDefault } = await import('firebase-admin/app')
  credential = applicationDefault()
}

if (!getApps().length) {
  initializeApp({ credential, projectId: 'bali-kitchen-82fe9' })
}

const db = getFirestore()

const INVENTORY = [
  { id: 'enzyme_30',    name: '酵素30包',         stock: 0, threshold: 10, unit: '袋' },
  { id: 'enzyme_100g',  name: '酵素100g',          stock: 0, threshold: 5,  unit: '袋' },
  { id: 'drink_500ml',  name: '発酵ドリンク500mL', stock: 0, threshold: 10, unit: '本' },
  { id: 'tongkat_30',   name: 'トンカットアリ30粒', stock: 0, threshold: 5,  unit: '袋' },
  { id: 'aogi_150g',    name: 'オーギエキス150g',  stock: 0, threshold: 5,  unit: '袋' },
]

console.log('\n📦 在庫マスタを登録中...')
for (const item of INVENTORY) {
  const { id, ...data } = item
  await db.collection('inventory').doc(id).set({
    ...data,
    updatedAt: new Date(),
  }, { merge: true })
  console.log(`  ✅ ${item.name} (stock: ${item.stock}, threshold: ${item.threshold})`)
}

console.log('\n✅ 完了。Firestoreコンソールで確認できます。')
console.log('   https://console.firebase.google.com/project/bali-kitchen-82fe9/firestore')
console.log('\n⚠ 初期在庫数は全て0です。実際の数量はアプリのオーナー画面から更新してください。')
process.exit(0)
