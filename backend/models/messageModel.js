import mongoose from 'mongoose';

const messageSchema = mongoose.Schema(
  {
    // The actual text content of the message
    text: {
      type: String,
      required: true,
    },
    // Is this message from the Bot (AI) or the User?
    isBot: {
      type: Boolean,
      default: false,
      required: true,
    },
    // (Optional) We will link this to a specific User later
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
  },
  {
    // Automatically adds 'createdAt' and 'updatedAt' times
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);

export default Message;