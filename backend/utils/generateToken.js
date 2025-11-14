import jwt from 'jsonwebtoken';

// This function takes a user's ID
// and creates a signed token for them.
const generateToken = (id) => {
  // jwt.sign() creates the token.
  // It takes 3 arguments:
  // 1. The payload: What data to store inside the token (just the user's ID).
  // 2. The secret: The private key from our .env file.
  // 3. Options: We set it to expire in 30 days.
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

export default generateToken;