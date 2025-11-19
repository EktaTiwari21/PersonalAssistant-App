import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    console.log("Checking available models...");
    // Fetch the list of models available for your API key
    // We specifically look for models that support 'generateContent'
    const response = await genAI.getGenerativeModel({ model: 'gemini-pro' });
    // Note: We need a model instance to call generic methods sometimes,
    // but let's try the direct model listing method provided by the SDK.

    // Actually, there isn't a direct 'listModels' on the client instance in the simplified SDK.
    // Let's just try the most standard, older model to see if it connects at all.
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent("Test");
    console.log("Success! 'gemini-pro' works.");
  } catch (error) {
    console.log("❌ Error with 'gemini-pro':", error.message);

    try {
        console.log("Trying 'gemini-1.5-flash'...");
        const model2 = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        await model2.generateContent("Test");
        console.log("Success! 'gemini-1.5-flash' works.");
    } catch (error2) {
         console.log("❌ Error with 'gemini-1.5-flash':", error2.message);
    }
  }
}

listModels();