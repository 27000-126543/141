import type {
  StolenData,
  MarketOrder,
  PriceSuggestion,
  MarketAnnouncement,
  Player,
} from '../../shared/types'

const orders = new Map<string, MarketOrder>()
const priceHistory = new Map<string, Array<{ date: string; price: number }>>()
const announcements: MarketAnnouncement[] = []

export const MarketService = {
  calculate7dAvgPrice(dataType: string, rarity: string): number {
    const key = `${dataType}_${rarity}`
    const history = priceHistory.get(key) || []
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const recentPrices = history.filter((h) => new Date(h.date) >= sevenDaysAgo)

    if (recentPrices.length === 0) {
      const basePrices: Record<string, number> = {
        common: 100,
        rare: 250,
        epic: 500,
        legendary: 1000,
      }
      return basePrices[rarity] || 100
    }

    const sum = recentPrices.reduce((acc, h) => acc + h.price, 0)
    return Math.floor(sum / recentPrices.length)
  },

  getPriceSuggestion(data: StolenData): PriceSuggestion {
    const avg7d = this.calculate7dAvgPrice(data.type, data.rarity)
    const volatility = 0.2 + Math.random() * 0.1
    const minPrice = Math.floor(avg7d * (1 - volatility))
    const maxPrice = Math.floor(avg7d * (1 + volatility))

    const key = `${data.type}_${data.rarity}`
    const history = priceHistory.get(key) || []
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const historicalPrices = history
      .filter((h) => new Date(h.date) >= sevenDaysAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-10)

    return {
      avg7d,
      range: [minPrice, maxPrice],
      historicalPrices,
    }
  },

  listData(data: StolenData, seller: Player, price: number): MarketOrder {
    const suggestion = this.getPriceSuggestion(data)

    if (price < suggestion.range[0] * 0.5) {
      throw new Error('定价过低，不能低于建议最低价的50%')
    }
    if (price > suggestion.range[1] * 2) {
      throw new Error('定价过高，不能高于建议最高价的200%')
    }

    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const order: MarketOrder = {
      id: orderId,
      dataId: data.id,
      data,
      sellerId: seller.id,
      sellerName: seller.username,
      price,
      suggestedMin: suggestion.range[0],
      suggestedMax: suggestion.range[1],
      status: 'listed',
      createdAt: new Date().toISOString(),
    }

    orders.set(orderId, order)
    return order
  },

  purchaseData(orderId: string, buyer: Player): { order: MarketOrder; announcement: MarketAnnouncement } {
    const order = orders.get(orderId)
    if (!order) {
      throw new Error('订单不存在')
    }
    if (order.status !== 'listed') {
      throw new Error('该数据已售出或已下架')
    }
    if (order.sellerId === buyer.id) {
      throw new Error('不能购买自己上架的数据')
    }
    if (buyer.credits < order.price) {
      throw new Error('积分不足')
    }

    order.status = 'sold'
    order.soldAt = new Date().toISOString()
    order.buyerId = buyer.id
    order.buyerName = buyer.username

    const key = `${order.data.type}_${order.data.rarity}`
    if (!priceHistory.has(key)) {
      priceHistory.set(key, [])
    }
    priceHistory.get(key)!.push({
      date: new Date().toISOString(),
      price: order.price,
    })

    const announcement = this.createAnnouncement(order)

    return { order, announcement }
  },

  cancelOrder(orderId: string, playerId: string): MarketOrder {
    const order = orders.get(orderId)
    if (!order) {
      throw new Error('订单不存在')
    }
    if (order.sellerId !== playerId) {
      throw new Error('无权取消他人的订单')
    }
    if (order.status !== 'listed') {
      throw new Error('只能取消待售中的订单')
    }

    order.status = 'cancelled'
    return order
  },

  recordPriceHistory(dataType: string, rarity: string, price: number): void {
    const key = `${dataType}_${rarity}`
    if (!priceHistory.has(key)) {
      priceHistory.set(key, [])
    }
    priceHistory.get(key)!.push({
      date: new Date().toISOString(),
      price,
    })
  },

  createAnnouncement(order: MarketOrder): MarketAnnouncement {
    const announcement: MarketAnnouncement = {
      id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dataName: order.data.name,
      rarity: order.data.rarity,
      sellerName: order.sellerName,
      buyerName: order.buyerName || '未知买家',
      price: order.price,
      timestamp: new Date().toISOString(),
    }

    announcements.unshift(announcement)
    if (announcements.length > 50) {
      announcements.pop()
    }

    return announcement
  },

  getRecentAnnouncements(limit: number = 20): MarketAnnouncement[] {
    return announcements.slice(0, limit)
  },

  getListedOrders(dataType?: string, rarity?: string, minPrice?: number, maxPrice?: number): MarketOrder[] {
    let result = Array.from(orders.values()).filter((o) => o.status === 'listed')

    if (dataType) {
      result = result.filter((o) => o.data.type === dataType)
    }
    if (rarity) {
      result = result.filter((o) => o.data.rarity === rarity)
    }
    if (minPrice !== undefined) {
      result = result.filter((o) => o.price >= minPrice)
    }
    if (maxPrice !== undefined) {
      result = result.filter((o) => o.price <= maxPrice)
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  getOrder(orderId: string): MarketOrder | undefined {
    return orders.get(orderId)
  },

  getPlayerOrders(playerId: string): MarketOrder[] {
    return Array.from(orders.values()).filter(
      (o) => o.sellerId === playerId || o.buyerId === playerId
    )
  },

  getPriceHistory(dataType: string, rarity: string, days: number = 7): Array<{ date: string; price: number }> {
    const key = `${dataType}_${rarity}`
    const history = priceHistory.get(key) || []
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

    return history
      .filter((h) => new Date(h.date) >= cutoff)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  },
}
