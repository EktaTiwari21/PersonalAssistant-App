import Message from '../models/messageModel.js';
import Period from '../models/periodModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// --- 1. UPDATED: processChat (Now saves User ID) ---
const processChat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    // A. Save User Message with their ID
    await Message.create({
        text: message,
        isBot: false,
        user: req.user._id // <--- CRITICAL: Stamps your ID
    });

    // B. AI Generation
    // (Optional: You can add the Period context logic here later if you want)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // C. Save Bot Reply with YOUR ID
    await Message.create({
        text: text,
        isBot: true,
        user: req.user._id // <--- CRITICAL: Stamps bot reply to YOU
    });

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
};

// --- 2. UPDATED: getChatHistory (Now filters by User ID) ---
const getChatHistory = async (req, res) => {
    try {
        // FILTER: Only find messages belonging to req.user._id
        const messages = await Message.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching history' });
    }
};

// --- 3. EXISTING: processVoice (This was already perfect!) ---
const processVoice = async (req, res) => {
  console.log("🎤 HIT: processVoice function called!");

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype);

    // Get Context
    const latestPeriod = await Period.findOne({ user: req.user._id }).sort({ startDate: -1 }); // Added User filter here too just in case
    let periodContext = "You do not have any data about the user's cycle yet.";
    if (latestPeriod) {
        const dateString = new Date(latestPeriod.startDate).toDateString();
        periodContext = `The user's last period started on: ${dateString}. The average cycle is 28 days.`;
    }

    // Send to Gemini
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a caring Personal Assistant. HEALTH DATA: ${periodContext}`
    });

    const result = await model.generateContent(["Listen to this audio and respond.", audioPart]);
    const response = await result.response;
    const aiReply = response.text();

    // Clean up
    fs.unlinkSync(req.file.path);

    // Save to DB (Your code already had this correct!)
    await Message.create({ text: "🎤 [Voice Message]", isBot: false, user: req.user._id });
    await Message.create({ text: aiReply, isBot: true, user: req.user._id });

    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("❌ VOICE PROCESSING ERROR:", error);
    res.status(500).json({ error: 'Voice error', details: error.message });
  }
};

export { processChat, getChatHistory, processVoice };