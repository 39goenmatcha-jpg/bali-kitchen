import { describe, it, expect } from 'vitest'
import { parseStockRow } from '../src/syncInventory.js'

describe('parseStockRow', () => {
  it('残数列から在庫オブジェクトを返す', () => {
    // シートの行データ例（2026/10/25）
    const row = ["2026/10/25","","","18","","","7","","","1","","","5","","","12","","","0","","","13","","","0"]
    const result = parseStockRow(row)
    expect(result).toEqual([
      { id: 'rai-10g', name: '抹茶 来RAI 10g', stock: 18, colIndex: 3 },
      { id: 'rai-30g', name: '抹茶 来RAI 30g', stock: 7, colIndex: 6 },
      { id: 'rai-50g', name: '抹茶 来RAI 50g', stock: 1, colIndex: 9 },
      { id: 'rai-100g', name: '抹茶 来RAI 100g', stock: 5, colIndex: 12 },
      { id: 'bi-10g', name: '抹茶 美BI 10g', stock: 12, colIndex: 15 },
      { id: 'bi-20g', name: '抹茶 美BI 20g', stock: 0, colIndex: 18 },
      { id: 'bi-30g', name: '抹茶 美BI 30g', stock: 13, colIndex: 21 },
      { id: 'bi-50g', name: '抹茶 美BI 50g', stock: 0, colIndex: 24 },
    ])
  })

  it('残数が空文字の場合はその商品をスキップする', () => {
    const row = ["2026/10/25","","","","","","7"]
    const result = parseStockRow(row)
    expect(result.find(r => r.id === 'rai-10g')).toBeUndefined()
    expect(result.find(r => r.id === 'rai-30g')?.stock).toBe(7)
  })

  it('残数が0の場合はスキップせず0として返す', () => {
    const row = Array(25).fill('')
    row[3] = '0'
    const result = parseStockRow(row)
    const item = result.find(r => r.id === 'rai-10g')
    expect(item).toBeDefined()
    expect(item.stock).toBe(0)
  })

  it('残数が数字でない文字列の場合はスキップする', () => {
    const row = Array(25).fill('')
    row[3] = 'abc'
    const result = parseStockRow(row)
    expect(result.find(r => r.id === 'rai-10g')).toBeUndefined()
  })
})
