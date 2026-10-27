const admin = require('firebase-admin')
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')
const QRCode = require('qrcode')

// pdf-lib 標準フォントはWinAnsi限定。非Latin1文字は '?' に置換
function safe(str) { return (str || '').replace(/[^\x00-\xFF]/g, '?') }

async function buildLabelPdfBytes(order) {
  const pdfDoc = await PDFDocument.create()
  // A6サイズ: 105mm × 148mm = 297.6pt × 419.5pt
  const page = pdfDoc.addPage([297.6, 419.5])
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  const { width, height } = page.getSize()
  let y = height - 20

  // ヘッダー
  page.drawRectangle({ x: 0, y: height - 50, width, height: 50, color: rgb(0.09, 0.64, 0.26) })
  page.drawText('BALI MATCHA', { x: 10, y: height - 35, size: 18, font: boldFont, color: rgb(1, 1, 1) })
  const dateStr = new Date().toISOString().slice(0, 10)
  page.drawText(dateStr, { x: width - 80, y: height - 35, size: 9, font, color: rgb(1, 1, 1) })

  y = height - 65
  // 注文番号
  page.drawText(safe(`Order: ${order.id}`), { x: 10, y, size: 8, font, color: rgb(0.4, 0.4, 0.4) })
  y -= 18

  // 区切り線
  page.drawLine({ start: { x: 10, y }, end: { x: width - 10, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
  y -= 14

  // 購入者情報
  page.drawText('Ship To:', { x: 10, y, size: 9, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
  y -= 14
  page.drawText(safe(order.buyerName), { x: 10, y, size: 11, font: boldFont, color: rgb(0, 0, 0) })
  y -= 13
  page.drawText(safe(order.buyerPhone), { x: 10, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) })
  y -= 12

  // 住所を折り返し（40文字で改行）
  const addr = safe(order.buyerAddress || '')
  const chunkSize = 40
  for (let i = 0; i < addr.length; i += chunkSize) {
    page.drawText(addr.slice(i, i + chunkSize), { x: 10, y, size: 9, font, color: rgb(0.2, 0.2, 0.2) })
    y -= 12
  }

  y -= 8
  page.drawLine({ start: { x: 10, y }, end: { x: width - 10, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.8) })
  y -= 14

  // 商品テーブルヘッダー
  page.drawText('Item', { x: 10, y, size: 9, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
  page.drawText('Qty', { x: 180, y, size: 9, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
  page.drawText('Price', { x: 230, y, size: 9, font: boldFont, color: rgb(0.1, 0.1, 0.1) })
  y -= 12

  for (const item of (order.items ?? [])) {
    const name = safe(item.name ?? '')
    const displayName = name.length > 22 ? name.slice(0, 22) + '...' : name
    page.drawText(displayName, { x: 10, y, size: 9, font, color: rgb(0, 0, 0) })
    page.drawText(String(item.qty ?? ''), { x: 180, y, size: 9, font, color: rgb(0, 0, 0) })
    page.drawText(String(item.price ?? ''), { x: 230, y, size: 9, font, color: rgb(0, 0, 0) })
    y -= 12
  }

  // QRコード（注文ID）
  const qrDataUrl = await QRCode.toDataURL(order.id, { width: 80, margin: 1 })
  const qrBase64 = qrDataUrl.split(',')[1]
  const qrBytes = Uint8Array.from(atob(qrBase64), c => c.charCodeAt(0))
  const qrImg = await pdfDoc.embedPng(qrBytes)
  page.drawImage(qrImg, { x: width - 90, y: 20, width: 70, height: 70 })
  page.drawText('Scan order ID', { x: width - 90, y: 15, size: 7, font, color: rgb(0.5, 0.5, 0.5) })

  return pdfDoc.save()
}

async function generateLabel(data, context) {
  if (!context.auth) throw new Error('unauthenticated')
  const { orderId } = data

  const db = admin.firestore()
  const snap = await db.collection('orders').doc(orderId).get()
  if (!snap.exists) throw new Error('order not found')

  const order = { id: orderId, ...snap.data() }
  const bytes = await buildLabelPdfBytes(order)

  const bucket = admin.storage().bucket()
  const file = bucket.file(`labels/${orderId}.pdf`)
  await file.save(Buffer.from(bytes), { contentType: 'application/pdf' })

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + 3600 * 1000,
  })

  await db.collection('orders').doc(orderId).update({
    labelUrl: url,
    status: 'printed',
  })

  return { labelUrl: url }
}

module.exports = { buildLabelPdfBytes, generateLabel }
