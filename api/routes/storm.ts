import { Router } from 'express';
import {
  getActiveStorms,
  createStorm,
  joinStorm,
} from '../controllers/StormController.js';

const router = Router();

router.get('/active', getActiveStorms);
router.post('/create', createStorm);
router.post('/:id/join', joinStorm);

export default router;
