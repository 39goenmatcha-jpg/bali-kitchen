import { vi } from 'vitest'

vi.mock('../src/firebase.js', () => ({
  db: {},
  auth: { onAuthStateChanged: vi.fn(() => vi.fn()) },
  storage: {},
  getMessagingInstance: vi.fn().mockResolvedValue(null),
}))
vi.mock('firebase/firestore', () => ({ collection: vi.fn(), addDoc: vi.fn(), serverTimestamp: vi.fn() }))

import { parseShopeeCSV } from '../src/components/CsvImporter'

it('ShopeeのCSVから注文オブジェクトの配列を返す', () => {
  const csv = `注文番号,購入者名,住所,電話番号,商品名,数量,単価\n123,田中太郎,バリ島,08123,抹茶 来RAI 10g,2,50000`
  const orders = parseShopeeCSV(csv)
  expect(orders[0]).toMatchObject({
    source: 'shopee',
    requiresLabel: true,
    buyerName: '田中太郎',
    items: [{ name: '抹茶 来RAI 10g', qty: 2, price: 50000 }],
  })
})
