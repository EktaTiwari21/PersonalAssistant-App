import express from 'express';
import multer from 'multer';
import { processChat, getChatHistory, processVoice } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- VERCEL FIX: Use Memory Storage instead of Disk Storage ---
// This keeps the file in RAM instead of trying to create an 'uploads' folder
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Routes
router.post('/', protect, processChat);
router.get('/', protect, getChatHistory);

// Note: The 'upload' middleware now saves to memory, which is safe for Vercel
router.post('/voice', protect, upload.single('audio'), processVoice);

export default router;