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

const processChat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    // 1. Save User Message with User ID
    await Message.create({
        text: message,
        isBot: false,
        user: req.user._id // <--- Linked to User
    });

    // ... (Context logic remains same) ...
    const latestPeriod = await Period.findOne({ user: req.user._id }).sort({ startDate: -1 });
    let periodContext = "No cycle data yet.";
    if (latestPeriod) {
        const dateString = new Date(latestPeriod.startDate).toDateString();
        periodContext = `Last period: ${dateString}.`;
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a Personal Assistant. Data: ${periodContext}`
    });

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    // 2. Save Bot Message with User ID
    await Message.create({
        text: text,
        isBot: true,
        user: req.user._id // <--- Linked to User
    });

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};

const processVoice = async (req, res) => {
    // (Logic is same, just adding User ID to database calls)
    try {
        if (!req.file) return res.status(400).json({ error: 'No file' });
        const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype);

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const result = await model.generateContent(["Listen and respond", audioPart]);
        const response = await result.response;
        const aiReply = response.text();

        fs.unlinkSync(req.file.path);

        // Save with User ID
        await Message.create({ text: "🎤 [Voice]", isBot: false, user: req.user._id });
        await Message.create({ text: aiReply, isBot: true, user: req.user._id });

        res.status(200).json({ reply: aiReply });
    } catch (error) {
        res.status(500).json({ error: 'Voice error' });
    }
};

const getChatHistory = async (req, res) => {
  try {
    // 3. FILTER: Only find messages that belong to THIS user
    const messages = await Message.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
};

export { processChat, getChatHistory, processVoice };