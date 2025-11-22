import express from 'express';
import multer from 'multer';
import { processChat, getChatHistory, processVoice } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js'; // <--- 1. Import Guard

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// 2. Add 'protect' to these routes.
// Now the server will force the app to show a VIP Ticket (Token).
router.post('/', protect, processChat);
router.get('/', protect, getChatHistory);
router.post('/voice', protect, upload.single('audio'), processVoice);

export default router;