const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp()

const { syncInventory } = require('./syncInventory')
const { notifyLowStock } = require('./notifyLowStock')
const { generateLabel } = require('./generateLabel')
const { completeDelivery } = require('./completeDelivery')

// 1分ごとにGoogle Sheets → Firestoreへ在庫同期
exports.syncInventoryScheduled = functions.scheduler
  .every(1).minutes()
  .onRun(syncInventory)

// 在庫更新時に閾値チェック → FCM通知
exports.notifyLowStockTrigger = functions.firestore
  .document('inventory/{productId}')
  .onUpdate(notifyLowStock)

// 送り状PDF生成（HTTPS callable）
exports.generateLabel = functions.https.onCall(generateLabel)

// 配送完了処理（HTTPS callable）
exports.completeDelivery = functions.https.onCall(completeDelivery)
