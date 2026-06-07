import type { Request, Response } from 'express';
import type {
  MarketOrder,
  StolenData,
  PriceSuggestion,
  MarketAnnouncement,
  APIError,
} from '../../shared/types.js';
import { getPlayerById, updatePlayer } from './AuthController.js';
import type { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketServer = (socketServer: Server) => {
  io = socketServer;
};

const stolenData = new Map<string, StolenData>();
const marketOrders = new Map<string, MarketOrder>();
const priceHistory = new Map<string, Array<{ date: string; price: number }>>();

const mockStolenData: StolenData[] = [
  {
    id: 'data-001',
    type: 'user_profiles',
    name: '50万用户个人信息包',
    rarity: 'rare',
    baseValue: 8500,
    ownerId: 'player-001',
    createdAt: '2026-06-01T14:30:00Z',
  },
  {
    id: 'data-002',
    type: 'tech_blueprints',
    name: '义体神经接口设计图',
    rarity: 'epic',
    baseValue: 85000,
    ownerId: 'player-001',
    createdAt: '2026-06-03T09:15:00Z',
  },
  {
    id: 'data-003',
    type: 'payment_records',
    name: '黑市交易记录合集',
    rarity: 'common',
    baseValue: 3200,
    ownerId: 'player-002',
    createdAt: '2026-06-02T16:45:00Z',
  },
  {
    id: 'data-004',
    type: 'police_intel',
    name: 'NCPD线人名单',
    rarity: 'legendary',
    baseValue: 125000,
    ownerId: 'player-001',
    createdAt: '2026-06-04T22:10:00Z',
  },
  {
    id: 'data-005',
    type: 'research_data',
    name: 'AI训练数据集',
    rarity: 'rare',
    baseValue: 12000,
    ownerId: 'player-003',
    createdAt: '2026-06-05T11:30:00Z',
  },
];

mockStolenData.forEach(data => stolenData.set(data.id, data));

const mockMarketOrders: MarketOrder[] = [
  {
    id: 'order-001',
    dataId: 'data-001',
    data: mockStolenData[0],
    sellerId: 'player-001',
    sellerName: 'NightHawk',
    price: 9500,
    suggestedMin: 7650,
    suggestedMax: 11050,
    status: 'listed',
    createdAt: '2026-06-05T12:00:00Z',
  },
  {
    id: 'order-002',
    dataId: 'data-002',
    data: mockStolenData[1],
    sellerId: 'player-001',
    sellerName: 'NightHawk',
    price: 95000,
    suggestedMin: 76500,
    suggestedMax: 110500,
    status: 'listed',
    createdAt: '2026-06-05T13:30:00Z',
  },
  {
    id: 'order-003',
    dataId: 'data-003',
    data: mockStolenData[2],
    sellerId: 'player-002',
    sellerName: 'CyberWolf',
    price: 3500,
    suggestedMin: 2880,
    suggestedMax: 4160,
    status: 'sold',
    createdAt: '2026-06-04T10:00:00Z',
    soldAt: '2026-06-04T15:30:00Z',
    buyerId: 'player-004',
    buyerName: 'ZeroDay',
  },
  {
    id: 'order-004',
    dataId: 'data-005',
    data: mockStolenData[4],
    sellerId: 'player-003',
    sellerName: 'GhostProtocol',
    price: 13500,
    suggestedMin: 10800,
    suggestedMax: 15600,
    status: 'listed',
    createdAt: '2026-06-05T14:00:00Z',
  },
];

mockMarketOrders.forEach(order => marketOrders.set(order.id, order));

mockStolenData.forEach(data => {
  const history: Array<{ date: string; price: number }> = [];
  const basePrice = data.baseValue;
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const variance = (Math.random() - 0.5) * 0.3 * basePrice;
    history.push({ date, price: Math.round(basePrice + variance) });
  }
  priceHistory.set(data.id, history);
});

const calculatePriceSuggestion = (data: StolenData): PriceSuggestion => {
  const history = priceHistory.get(data.id) || [];
  if (history.length === 0) {
    return {
      avg7d: data.baseValue,
      range: [Math.round(data.baseValue * 0.8), Math.round(data.baseValue * 1.2)],
      historicalPrices: [],
    };
  }

  const avg7d = Math.round(history.reduce((sum, h) => sum + h.price, 0) / history.length);
  const minPrice = Math.min(...history.map(h => h.price));
  const maxPrice = Math.max(...history.map(h => h.price));
  const range: [number, number] = [Math.round(minPrice * 0.9), Math.round(maxPrice * 1.1)];

  return {
    avg7d,
    range,
    historicalPrices: history,
  };
};

export const getOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, sellerId, buyerId } = req.query;

    let orders = Array.from(marketOrders.values());

    if (status) {
      orders = orders.filter(o => o.status === status);
    }
    if (sellerId) {
      orders = orders.filter(o => o.sellerId === sellerId);
    }
    if (buyerId) {
      orders = orders.filter(o => o.buyerId === buyerId);
    }

    orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.status(200).json(orders);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getPriceSuggestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataId } = req.params;

    const data = stolenData.get(dataId);
    if (!data) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Data not found',
        code: 404,
      } as APIError);
      return;
    }

    const suggestion = calculatePriceSuggestion(data);
    res.status(200).json(suggestion);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const listData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dataId, sellerId, price } = req.body;

    if (!dataId || !sellerId || !price) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Data ID, seller ID, and price are required',
        code: 400,
      } as APIError);
      return;
    }

    const data = stolenData.get(dataId);
    const seller = getPlayerById(sellerId);

    if (!data || !seller) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Data or seller not found',
        code: 404,
      } as APIError);
      return;
    }

    if (data.ownerId !== sellerId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not own this data',
        code: 403,
      } as APIError);
      return;
    }

    const existingOrder = Array.from(marketOrders.values()).find(
      o => o.dataId === dataId && o.status === 'listed'
    );
    if (existingOrder) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This data is already listed on the market',
        code: 409,
      } as APIError);
      return;
    }

    const suggestion = calculatePriceSuggestion(data);

    const orderId = `order-${Date.now()}`;
    const order: MarketOrder = {
      id: orderId,
      dataId,
      data,
      sellerId,
      sellerName: seller.username,
      price,
      suggestedMin: suggestion.range[0],
      suggestedMax: suggestion.range[1],
      status: 'listed',
      createdAt: new Date().toISOString(),
    };

    marketOrders.set(orderId, order);

    res.status(201).json(order);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const buyData = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { buyerId } = req.body;

    if (!buyerId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Buyer ID is required',
        code: 400,
      } as APIError);
      return;
    }

    const order = marketOrders.get(id);
    const buyer = getPlayerById(buyerId);

    if (!order || !buyer) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Order or buyer not found',
        code: 404,
      } as APIError);
      return;
    }

    if (order.status !== 'listed') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'This order is no longer available',
        code: 400,
      } as APIError);
      return;
    }

    if (order.sellerId === buyerId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'You cannot buy your own data',
        code: 400,
      } as APIError);
      return;
    }

    if (buyer.credits < order.price) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Insufficient credits',
        code: 400,
      } as APIError);
      return;
    }

    order.status = 'sold';
    order.buyerId = buyerId;
    order.buyerName = buyer.username;
    order.soldAt = new Date().toISOString();

    const history = priceHistory.get(order.dataId) || [];
    history.push({
      date: new Date().toISOString().split('T')[0],
      price: order.price,
    });
    if (history.length > 7) history.shift();
    priceHistory.set(order.dataId, history);

    const seller = getPlayerById(order.sellerId);
    if (seller) {
      updatePlayer(order.sellerId, { credits: seller.credits + order.price });
    }
    updatePlayer(buyerId, { credits: buyer.credits - order.price });

    stolenData.set(order.dataId, {
      ...order.data,
      ownerId: buyerId,
      createdAt: new Date().toISOString(),
    });

    const announcement: MarketAnnouncement = {
      id: `ann-${Date.now()}`,
      dataName: order.data.name,
      rarity: order.data.rarity,
      sellerName: order.sellerName,
      buyerName: buyer.username,
      price: order.price,
      timestamp: new Date().toISOString(),
    };

    io?.emit('market:announce', announcement);

    res.status(200).json({
      success: true,
      message: 'Purchase successful',
      order,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const cancelOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { sellerId } = req.body;

    if (!sellerId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Seller ID is required',
        code: 400,
      } as APIError);
      return;
    }

    const order = marketOrders.get(id);
    if (!order) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Order not found',
        code: 404,
      } as APIError);
      return;
    }

    if (order.sellerId !== sellerId) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You cannot cancel this order',
        code: 403,
      } as APIError);
      return;
    }

    if (order.status !== 'listed') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Only listed orders can be cancelled',
        code: 400,
      } as APIError);
      return;
    }

    order.status = 'cancelled';

    res.status(200).json({
      success: true,
      message: 'Order cancelled',
      order,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getStolenDataById = (dataId: string): StolenData | undefined => {
  return stolenData.get(dataId);
};

export const addStolenData = (data: StolenData) => {
  stolenData.set(data.id, data);

  const history: Array<{ date: string; price: number }> = [];
  const basePrice = data.baseValue;
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const variance = (Math.random() - 0.5) * 0.3 * basePrice;
    history.push({ date, price: Math.round(basePrice + variance) });
  }
  priceHistory.set(data.id, history);
};
