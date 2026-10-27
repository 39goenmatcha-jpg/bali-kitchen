const { buildLabelPdfBytes } = require('../src/generateLabel')

it('Uint8Arrayを返す（PDFバイト列）', async () => {
  const order = {
    id: 'test-001',
    source: 'shopee',
    buyerName: '田中太郎',
    buyerAddress: 'Bali, Indonesia',
    buyerPhone: '08123456789',
    items: [{ name: '抹茶 来RAI 10g', qty: 2, price: 50000 }],
  }
  const bytes = await buildLabelPdfBytes(order)
  expect(bytes).toBeInstanceOf(Uint8Array)
  expect(bytes.length).toBeGreaterThan(100)
})
