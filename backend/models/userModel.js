import mongoose from 'mongoose';

// 1. Define the "Blueprint" (Schema)
// This describes what a "User" document should look like in our database.
const userSchema = new mongoose.Schema(
  {
    // A user must have a name, which is a String
    name: {
      type: String,
      required: true,
    },
    // A user must have an email, which is a String and must be unique
    email: {
      type: String,
      required: true,
      unique: true,
    },
    // A user must have a password, which is a String
    password: {
      type: String,
      required: true,
    },
  },
  {
    // 2. Options: Automatically add "createdAt" and "updatedAt" fields
    // This is super useful for tracking when data was created or changed.
    timestamps: true,
  }
);

// 3. Create the "Model"
// We give Mongoose the blueprint ("userSchema") and tell it
// what to call the collection in the database ("User").
const User = mongoose.model('User', userSchema);

// 4. Export the Model
// This lets us use our "User" model in other files.
export default User;