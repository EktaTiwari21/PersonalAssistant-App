import Message from '../models/messageModel.js';
import Period from '../models/periodModel.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs'; // New import for file handling

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert file to Gemini-readable format
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

// @desc    Process text chat message
// @route   POST /api/chat
const processChat = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    await handleConversation(message, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
};

// @desc    Process voice audio message
// @route   POST /api/chat/voice
const processVoice = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log("🎤 Voice received:", req.file.path);

    // 1. Prepare the Audio for Gemini
    const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype);

    // 2. Get Latest Period Data (Context)
    const latestPeriod = await Period.findOne().sort({ startDate: -1 });
    let periodContext = "You do not have any data about the user's cycle yet.";
    if (latestPeriod) {
        const dateString = new Date(latestPeriod.startDate).toDateString();
        periodContext = `The user's last period started on: ${dateString}. The average cycle is 28 days.`;
    }

    // 3. Send Audio + Context to Gemini
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash', // Flash is great for multimodal (audio)
        systemInstruction: `You are a caring Personal Assistant for women.
        Your goal is to help manage health, work, skincare, and cycle tracking.

        IMPORTANT HEALTH DATA:
        ${periodContext}

        The user is speaking to you. Transcribe their intent and respond helpfully.
        Keep answers concise and supportive.`
    });

    // "Prompt" the AI with the audio file
    const result = await model.generateContent([
        "Listen to this audio request and respond.",
        audioPart
    ]);
    const response = await result.response;
    const aiReply = response.text();

    console.log("🤖 AI Voice Reply:", aiReply);

    // 4. Clean up (delete) the temp audio file
    fs.unlinkSync(req.file.path);

    // 5. Save to Database (We save a placeholder for the user's voice note)
    await Message.create({ text: "🎤 [Voice Message]", isBot: false });
    await Message.create({ text: aiReply, isBot: true });

    // 6. Send response
    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("Voice Error:", error);
    res.status(500).json({ error: 'Error processing voice' });
  }
};

// Reusable logic for text and voice responses
async function handleConversation(userMessage, res) {
    // Save User Message
    await Message.create({ text: userMessage, isBot: false });
    console.log(`User: ${userMessage}`);

    // Get Context
    const latestPeriod = await Period.findOne().sort({ startDate: -1 });
    let periodContext = "You do not have any data about the user's cycle yet.";
    if (latestPeriod) {
        const dateString = new Date(latestPeriod.startDate).toDateString();
        periodContext = `The user's last period started on: ${dateString}. The average cycle is 28 days.`;
    }

    // Call AI
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: `You are a caring Personal Assistant for women.
        HEALTH DATA: ${periodContext}
        Keep answers concise, supportive, and practical.`
    });

    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();

    // Save Bot Message
    await Message.create({ text: text, isBot: true });
    console.log(`Bot: ${text}`);

    res.status(200).json({ reply: text });
}

const getChatHistory = async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching history' });
  }
};

export { processChat, getChatHistory, processVoice };