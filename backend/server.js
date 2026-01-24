import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import periodRoutes from './routes/periodRoutes.js';

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/period', periodRoutes);

// --- VERCEL EXPORT CONFIGURATION ---
const PORT = process.env.PORT || 5000;

// Only listen if we are NOT in production (Running locally)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel (Must use 'export default' with imports)
export default app;