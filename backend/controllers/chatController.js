import Message from '../models/messageModel.js';
import Period from '../models/periodModel.js'; // <-- 1. Import Period Model
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const processChat = async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    await Message.create({ text: message, isBot: false });
    console.log(`User: ${message}`);

    // --- 2. Fetch Latest Period Data ---
    const latestPeriod = await Period.findOne().sort({ startDate: -1 });

    let periodContext = "You do not have any data about the user's cycle yet.";
    if (latestPeriod) {
        const dateString = new Date(latestPeriod.startDate).toDateString();
        periodContext = `The user's last period started on: ${dateString}. The average cycle is 28 days.`;
    }
    // -----------------------------------

    // --- 3. Inject Data into Persona ---
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a caring Personal Assistant for women.
        Your goal is to help manage health, work, skincare, and cycle tracking.

        IMPORTANT HEALTH DATA:
        ${periodContext}

        If the user asks "When is my period due?", calculate it based on the last start date + 28 days.
        Keep answers concise and supportive.`
    });
    // -----------------------------------

    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();

    await Message.create({ text: text, isBot: true });
    console.log(`Bot: ${text}`);

    res.status(200).json({ reply: text });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
};

export { processChat, getChatHistory };