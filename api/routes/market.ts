import { Router } from 'express';
import {
  getOrders,
  getPriceSuggestion,
  listData,
  buyData,
  cancelOrder,
} from '../controllers/MarketController.js';

const router = Router();

router.get('/orders', getOrders);
router.get('/price-suggestion/:dataId', getPriceSuggestion);
router.post('/list', listData);
router.post('/buy/:id', buyData);
router.delete('/orders/:id', cancelOrder);

export default router;
