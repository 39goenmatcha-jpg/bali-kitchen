const { shouldNotify } = require('../src/notifyLowStock')

it('在庫が閾値以下かつ前回より減ったとき trueを返す', () => {
  expect(shouldNotify({ before: 21, after: 19, threshold: 20 })).toBe(true)
})
it('在庫が閾値より多いとき falseを返す', () => {
  expect(shouldNotify({ before: 25, after: 22, threshold: 20 })).toBe(false)
})
it('在庫が増えたとき（入庫）falseを返す', () => {
  expect(shouldNotify({ before: 15, after: 25, threshold: 20 })).toBe(false)
})
