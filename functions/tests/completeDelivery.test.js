const { buildOutRows } = require('../src/completeDelivery')

it('注文のitemsからシートに追記する行データを返す', () => {
  const order = {
    items: [
      { productId: 'rai-10g', qty: 2 },
      { productId: 'bi-30g', qty: 1 },
    ],
    deliveredAt: new Date('2026-10-27'),
  }
  const rows = buildOutRows(order)
  // 各商品につき1行: [日付, 出庫数, "", ""] の4要素
  expect(rows).toHaveLength(2)
  expect(rows[0][0]).toBe('2026/10/27')
  expect(rows[0][1]).toBe(2)
})
