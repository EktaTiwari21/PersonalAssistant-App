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

// Enable CORS for everyone
app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
  res.send('API is running successfully!');
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/period', periodRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;