import { describe, it, expect } from 'vitest'
import { ja } from '../src/i18n/ja.js'
import { id } from '../src/i18n/id.js'

describe('i18n: 必須キー', () => {
  it('ja: 必須キーが存在する', () => {
    expect(ja.dashboard).toBeDefined()
    expect(ja.logout).toBeDefined()
    expect(ja.lowStockAnnouncement).toBeDefined()
    expect(ja.printLabel).toBeDefined()
    expect(ja.completeDelivery).toBeDefined()
    expect(ja.stockRemaining).toBeDefined()
  })

  it('id: 必須キーが存在する', () => {
    expect(id.dashboard).toBeDefined()
    expect(id.logout).toBeDefined()
    expect(id.lowStockAnnouncement).toBeDefined()
    expect(id.printLabel).toBeDefined()
    expect(id.completeDelivery).toBeDefined()
    expect(id.stockRemaining).toBeDefined()
  })

  it('ja: lowStockAnnouncementは{name}と{stock}プレースホルダーを含む', () => {
    expect(ja.lowStockAnnouncement).toContain('{name}')
    expect(ja.lowStockAnnouncement).toContain('{stock}')
  })

  it('id: lowStockAnnouncementは{name}と{stock}プレースホルダーを含む', () => {
    expect(id.lowStockAnnouncement).toContain('{name}')
    expect(id.lowStockAnnouncement).toContain('{stock}')
  })
})
