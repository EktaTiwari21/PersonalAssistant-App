import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js'; // <-- 1. IMPORT USER ROUTES

// Load our environment variables (from .env)
dotenv.config();

// Connect to our database
connectDB();

// Initialize our Express app
const app = express();

// ---  NEW ---
// 1. Add middleware to parse incoming JSON data.
// This must come *before* your routes.
app.use(express.json());

// Define a port for our server to listen on
const PORT = process.env.PORT || 5000;

// --- OLD ROUTE (we can remove it) ---
// app.get('/', (req, res) => {
//   res.send('Welcome! My server auto-restarted!');
// });

// --- NEW ROUTE ---
// 2. TELL EXPRESS TO USE THE ROUTES
// Any URL that starts with '/api/users' will be handled
// by the 'userRoutes' file we just created.
app.use('/api/users', userRoutes);


// Tell the app to start listening on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});