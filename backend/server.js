import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import periodRoutes from './routes/periodRoutes.js'; // <-- Check this line (Line 6 or 7)

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Use Routes
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/period', periodRoutes); // <-- Check this line (Line 19)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});