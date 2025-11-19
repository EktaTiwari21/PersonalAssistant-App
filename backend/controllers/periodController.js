import Period from '../models/periodModel.js';

// @desc    Log a new period start date
// @route   POST /api/period
const addPeriod = async (req, res) => {
  const { startDate, duration } = req.body;

  if (!startDate) {
    return res.status(400).json({ error: 'Start date is required' });
  }

  try {
    const newPeriod = await Period.create({
      startDate: new Date(startDate),
      duration: duration || 5, // Default to 5 days if not specified
    });

    res.status(201).json(newPeriod);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error adding period' });
  }
};

// @desc    Get the user's latest period
// @route   GET /api/period/latest
const getLatestPeriod = async (req, res) => {
  try {
    // Find one, sort by start date descending (newest first)
    const latestPeriod = await Period.findOne().sort({ startDate: -1 });

    if (latestPeriod) {
      res.json(latestPeriod);
    } else {
      res.json({ message: 'No period data found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error fetching period data' });
  }
};

export { addPeriod, getLatestPeriod };