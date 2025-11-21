import express from 'express';
import multer from 'multer'; // <-- Import Multer
import { processChat, getChatHistory, processVoice } from '../controllers/chatController.js';

const router = express.Router();

// Configure Multer to save files to 'uploads/' folder
const upload = multer({ dest: 'uploads/' });

router.post('/', processChat);
router.get('/', getChatHistory);

// --- NEW VOICE ROUTE ---
// 'audio' is the name of the field we will send from the frontend
router.post('/voice', upload.single('audio'), processVoice);

export default router;