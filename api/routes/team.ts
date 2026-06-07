import { Router } from 'express';
import {
  getTeam,
  createTeam,
  createApplication,
  approveApplication,
  updateMemberRole,
  removeMember,
} from '../controllers/TeamController.js';

const router = Router();

router.get('/', getTeam);
router.post('/', createTeam);
router.post('/applications', createApplication);
router.post('/applications/:id/approve', approveApplication);
router.put('/members/:playerId/role', updateMemberRole);
router.delete('/members/:playerId', removeMember);

export default router;
