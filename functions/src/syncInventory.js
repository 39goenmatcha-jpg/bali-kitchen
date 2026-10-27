// 在庫列の定義: { id, name, colIndex（残数列のインデックス） }
const INVENTORY_COLUMNS = [
  { id: 'rai-10g',  name: '抹茶 来RAI 10g',  colIndex: 3  },
  { id: 'rai-30g',  name: '抹茶 来RAI 30g',  colIndex: 6  },
  { id: 'rai-50g',  name: '抹茶 来RAI 50g',  colIndex: 9  },
  { id: 'rai-100g', name: '抹茶 来RAI 100g', colIndex: 12 },
  { id: 'bi-10g',   name: '抹茶 美BI 10g',   colIndex: 15 },
  { id: 'bi-20g',   name: '抹茶 美BI 20g',   colIndex: 18 },
  { id: 'bi-30g',   name: '抹茶 美BI 30g',   colIndex: 21 },
  { id: 'bi-50g',   name: '抹茶 美BI 50g',   colIndex: 24 },
]

/**
 * シートの1行データから在庫オブジェクトの配列を返す純粋関数
 * @param {string[]} row - スプレッドシートの行データ
 * @returns {{ id, name, stock, colIndex }[]}
 */
export function parseStockRow(row) {
  const results = []
  for (const col of INVENTORY_COLUMNS) {
    const raw = row[col.colIndex]
    if (raw === undefined || raw === null || raw === '') continue
    const stock = parseInt(raw, 10)
    if (isNaN(stock)) continue
    results.push({ id: col.id, name: col.name, stock, colIndex: col.colIndex })
  }
  return results
}

/**
 * Google Sheets の最終行（最新日付）を特定して在庫を返す
 * @param {string[][]} rows - スプレッドシートの全行データ
 * @returns {{ id, name, stock, colIndex }[]}
 */
export function extractLatestStock(rows) {
  // 日付列（A列）に値があり、かつ残数列に有効な値がある行を最後から探す
  for (let i = rows.length - 1; i >= 0; i--) {
    const row = rows[i]
    const items = parseStockRow(row)
    if (items.length > 0) return items
  }
  return []
}

/**
 * Cloud Functions スケジュール実行: Sheets → Firestore 同期
 * Firebase Admin SDKとGoogle Sheets APIを使用
 */
export async function syncInventory() {
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore')
  const { google } = await import('googleapis')

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  })
  const sheets = google.sheets({ version: 'v4', auth })

  const SPREADSHEET_ID = '1A8ha-3g5GnB2zYoPXrVKFQvjNv18231ELK3PPchgjFM'
  const RANGE = "Depur(キッチン）在庫!A1:AB200"

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  })

  const rows = response.data.values || []
  const items = extractLatestStock(rows)

  const db = getFirestore()
  const batch = db.batch()

  for (const item of items) {
    const ref = db.collection('inventory').doc(item.id)
    batch.set(ref, {
      name: item.name,
      stock: item.stock,
      lastUpdated: FieldValue.serverTimestamp(),
      sheetRange: `Depur(キッチン）在庫!${String.fromCharCode(65 + item.colIndex)}`,
    }, { merge: true })
    // threshold は既存値を保持（merge: true で上書きしない）
  }

  await batch.commit()
}
