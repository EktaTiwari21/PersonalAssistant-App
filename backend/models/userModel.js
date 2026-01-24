import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // <--- 1. Import bcryptjs

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// --- 2. ADD THIS: Method to check if password matches ---
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- 3. ADD THIS: Encrypt password before saving ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  // Generate a "salt" and hash the password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema);

export default User;