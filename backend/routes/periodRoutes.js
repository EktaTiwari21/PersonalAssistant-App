import express from 'express';
import { addPeriod, getLatestPeriod } from '../controllers/periodController.js';

const router = express.Router();

// Route to log a new period
router.post('/', addPeriod);

// Route to get the most recent period info
router.get('/latest', getLatestPeriod);

export default router;