const admin = require('firebase-admin')
const { google } = require('googleapis')

const SPREADSHEET_ID = '1A8ha-3g5GnB2zYoPXrVKFQvjNv18231ELK3PPchgjFM'
const SHEET_NAME = 'Depur(キッチン）在庫'

// 商品IDから出庫列の範囲を返す
const OUT_COLUMN_MAP = {
  'rai-10g':  'D', 'rai-30g':  'G', 'rai-50g':  'J', 'rai-100g': 'M',
  'bi-10g':   'P', 'bi-20g':   'S', 'bi-30g':   'V', 'bi-50g':   'Y',
}

function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

function buildOutRows(order) {
  const dateStr = formatDate(order.deliveredAt)
  return (order.items ?? []).map(item => [dateStr, item.qty, '', ''])
}

async function completeDelivery(data, context) {
  if (!context.auth) throw new Error('unauthenticated')
  const { orderId } = data

  const db = admin.firestore()
  const orderRef = db.collection('orders').doc(orderId)

  // アトミックなステータス更新（二重カウント防止）
  let order
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(orderRef)
    if (!snap.exists) throw new Error('order not found')
    order = snap.data()
    if (order.status === 'delivered') return // 冪等性
    tx.update(orderRef, {
      status: 'delivered',
      deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
    })
  })

  // すでに delivered だった場合は早期リターン
  if (order.status === 'delivered') return { ok: true }

  // 2. Google Sheets APIで出庫行追記
  try {
    const sheetsAuth = new google.auth.GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    })
    const sheets = google.sheets({ version: 'v4', auth: sheetsAuth })
    const dateStr = formatDate(new Date())

    await Promise.all(
      (order.items ?? []).map(item => {
        const col = OUT_COLUMN_MAP[item.productId]
        if (!col) return Promise.resolve()
        // colIndex = col のアルファベット位置（0-based）
        const colIdx = col.charCodeAt(0) - 65
        // 行データ: A列=日付、商品列=出庫数、他は空
        const row = new Array(colIdx + 1).fill('')
        row[0] = dateStr
        row[colIdx] = item.qty
        return sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!A:A`,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [row] },
        })
      })
    )
  } catch {
    // Sheets書き込みが失敗してもFirestore在庫減算は続行
  }

  // 3. Firestoreの在庫を減算
  const batch = db.batch()
  for (const item of (order.items ?? [])) {
    const invRef = db.collection('inventory').doc(item.productId)
    batch.update(invRef, {
      stock: admin.firestore.FieldValue.increment(-item.qty),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    })
  }
  await batch.commit()

  return { ok: true }
}

module.exports = { buildOutRows, completeDelivery }
