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

// ... (Keep processChat function as is) ...
const processChat = async (req, res) => {
  // ... (Your existing chat logic) ...
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'No message provided' });

  try {
    await handleConversation(message, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error processing chat' });
  }
};

// --- UPDATED VOICE FUNCTION ---
const processVoice = async (req, res) => {
  console.log("🎤 HIT: processVoice function called!"); // <--- DEBUG 1

  try {
    if (!req.file) {
      console.log("❌ Error: No file in request"); // <--- DEBUG 2
      return res.status(400).json({ error: 'No audio file uploaded' });
    }

    console.log("🎤 Voice file received at:", req.file.path); // <--- DEBUG 3

    const audioPart = fileToGenerativePart(req.file.path, req.file.mimetype);

    // Get Context
    const latestPeriod = await Period.findOne().sort({ startDate: -1 });
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

    console.log("🚀 Sending to Gemini...");
    const result = await model.generateContent(["Listen to this audio and respond.", audioPart]);
    const response = await result.response;
    const aiReply = response.text();

    console.log("🤖 AI Replied:", aiReply);

    // Clean up
    fs.unlinkSync(req.file.path);

    // Save to DB
    await Message.create({ text: "🎤 [Voice Message]", isBot: false, user: req.user._id });
    await Message.create({ text: aiReply, isBot: true, user: req.user._id });

    res.status(200).json({ reply: aiReply });

  } catch (error) {
    console.error("---------------------------------");
    console.error("❌ VOICE PROCESSING ERROR:");
    console.error(error);
    if (error.response) {
        // This prints the exact reason if Google rejects the key/file
        console.error("Google API Details:", JSON.stringify(error.response, null, 2));
    }
    console.error("---------------------------------");
    res.status(500).json({ error: 'Voice error', details: error.message });
  }
};

// ... (Keep handleConversation and getChatHistory as is) ...
async function handleConversation(userMessage, res) {
    // ... (Your existing logic) ...
    // (Simplified for brevity - paste your existing handleConversation here or keep it from before)
    // If you need the full file again, let me know!
    await Message.create({ text: userMessage, isBot: false });
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(userMessage);
    const response = await result.response;
    const text = response.text();
    await Message.create({ text: text, isBot: true });
    res.status(200).json({ reply: text });
}

const getChatHistory = async (req, res) => {
    // ... (Your existing logic) ...
    const messages = await Message.find().sort({ createdAt: -1 });
    res.status(200).json(messages);
};

export { processChat, getChatHistory, processVoice };