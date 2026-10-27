const admin = require('firebase-admin')

function shouldNotify({ before, after, threshold }) {
  return after <= threshold && after < before
}

async function notifyLowStock(change, context) {
  const before = change.before.data()
  const after = change.after.data()
  const productId = context.params.productId

  if (!shouldNotify({ before: before.stock, after: after.stock, threshold: after.threshold ?? 20 })) {
    return null
  }

  const db = admin.firestore()
  const messaging = admin.messaging()

  // 全ユーザーのFCMトークンを収集
  const usersSnap = await db.collection('users').get()
  const tokens = usersSnap.docs
    .map(d => d.data().fcmToken)
    .filter(Boolean)

  if (tokens.length > 0) {
    await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: '在庫アラート / Peringatan Stok',
        body: `${after.name}: ${after.stock}個`,
      },
      data: { productId, stock: String(after.stock) },
    })
  }

  // 通知レコードを書き込む（AlarmContextが購読する）
  await db.collection('notifications').add({
    productId,
    name: after.name,
    stock: after.stock,
    acknowledged: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  })

  return null
}

module.exports = { shouldNotify, notifyLowStock }
