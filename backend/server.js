import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <--- NEW IMPORT
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import periodRoutes from './routes/periodRoutes.js';

dotenv.config();
connectDB();

const app = express();

// --- ALLOW FRONTEND CONNECTIONS (CORS) ---
app.use(cors({
  origin: '*', // Allow connections from ANYWHERE (Easiest for now)
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

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