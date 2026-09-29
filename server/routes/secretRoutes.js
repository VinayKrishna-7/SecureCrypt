import express from 'express';
import {
  createSecret,
  getSecretStatus,
  revealSecret,
  deleteSecret
} from '../controllers/secretController.js';
import { createPasteLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/', createPasteLimiter, createSecret);
router.get('/:id/status', getSecretStatus);
router.post('/:id/reveal', revealSecret);
router.delete('/:id', deleteSecret);

export default router;
