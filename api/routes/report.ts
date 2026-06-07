import { Router } from 'express';
import {
  getWeeklyReport,
  getRanking,
} from '../controllers/ReportController.js';

const router = Router();

router.get('/weekly', getWeeklyReport);
router.get('/ranking', getRanking);

export default router;
