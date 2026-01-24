import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import periodRoutes from './routes/periodRoutes.js';

dotenv.config();
connectDB();

const app = express();

// --- ALLOW FRONTEND CONNECTIONS (CORS) ---
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ✅ 1. ADD THIS HEALTH CHECK HERE
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/period', periodRoutes);

// --- VERCEL EXPORT CONFIGURATION ---
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;