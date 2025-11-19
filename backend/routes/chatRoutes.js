import express from 'express';
import { processChat, getChatHistory } from '../controllers/chatController.js';

const router = express.Router();

// When the app sends a POST request, process the chat
router.post('/', processChat);

// --- NEW ---
// When the app sends a GET request, fetch the history
router.get('/', getChatHistory);

export default router;