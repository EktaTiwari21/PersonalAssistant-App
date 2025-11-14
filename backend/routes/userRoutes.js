import express from 'express';
const router = express.Router();
// 1. Import all our functions
import {
  registerUser,
  loginUser,
  getUserProfile,
} from '../controllers/userController.js';
// 2. Import our "security guard"
import { protect } from '../middleware/authMiddleware.js';

// Public Routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// --- NEW PROTECTED ROUTE ---
// 3. When a GET request hits '/profile',
//    it will *first* run the 'protect' middleware.
//    If the token is valid, it will *then* run 'getUserProfile'.
router.get('/profile', protect, getUserProfile);

export default router;