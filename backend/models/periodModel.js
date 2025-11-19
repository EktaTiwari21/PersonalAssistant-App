import mongoose from 'mongoose';

const periodSchema = mongoose.Schema(
  {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: false,
    },
    // Average cycle length (usually 28 days)
    cycleLength: {
      type: Number,
      default: 28,
    },
    // Optional: Notes about symptoms (cramps, flow, etc.)
    symptoms: {
      type: String,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

const Period = mongoose.model('Period', periodSchema);

export default Period;