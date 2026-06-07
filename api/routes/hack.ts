import { Router } from 'express';
import {
  getTargets,
  startHack,
  getSession,
  useSkill,
} from '../controllers/HackController.js';

const router = Router();

router.get('/targets', getTargets);
router.post('/start', startHack);
router.get('/sessions/:id', getSession);
router.post('/sessions/:id/skill', useSkill);

export default router;
