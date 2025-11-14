import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/userModel.js';

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // 1. Check for the token in the request "headers"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 2. Get the token from the header (it looks like "Bearer [token]")
      token = req.headers.authorization.split(' ')[1];

      // 3. Verify the token using our secret
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Find the user from the token's ID and attach them to the request
      // We 'select(-password)' to remove the password from the object
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Call 'next()' to pass the request to the *next* function (the controller)
      next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401 Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

export { protect };