import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

console.log("🔑 Using Key ending in:", API_KEY ? API_KEY.slice(-4) : "NO KEY FOUND");
console.log("📡 Connecting to Google...");

async function getModels() {
  try {
    const response = await fetch(URL);
    const data = await response.json();

    if (data.error) {
        console.error("❌ API Error:", data.error.message);
        return;
    }

    console.log("\n✅ SUCCESS! Here are the models you can use:");
    console.log("---------------------------------------------");

    // Filter and print only the models that can generate text
    const chatModels = data.models.filter(model =>
        model.supportedGenerationMethods.includes("generateContent")
    );

    chatModels.forEach(model => {
        console.log(`Model Name: ${model.name}`); // This will look like 'models/gemini-pro'
    });

    console.log("---------------------------------------------");
  } catch (error) {
    console.error("❌ Network Error:", error.message);
  }
}

getModels();