
# AI Personal Assistant App (MERN + React Native)

A smart, voice-enabled personal assistant designed for women's health and daily productivity. Built with the MERN stack (MongoDB, Express, React Native, Node.js) and powered by Google Gemini AI.

## ✨ Features

* **Smart AI Chat:** Powered by Google's **Gemini 2.0 Flash** model for fast, empathetic responses.
* **Voice Integration:** Talk to your assistant and hear it speak back (Speech-to-Text & Text-to-Speech).
* **Cycle Tracker:** Log your period dates and get AI-powered predictions for your next cycle.
* **User Authentication:** Secure Sign Up & Login system using JWT (JSON Web Tokens).
* **Cloud Database:** Data persistence with **MongoDB Atlas**.
* **Local Notifications:** Get reminders for your upcoming cycle.
* **Modern UI:** Dark mode interface with glassmorphism design elements.

## 🛠️ Tech Stack

**Frontend:**
* React Native (Expo)
* TypeScript
* `react-native-gifted-chat` (UI)
* `expo-av` (Audio Recording)
* `expo-speech` (Text-to-Speech)

**Backend:**
* Node.js & Express.js
* MongoDB & Mongoose
* Google Generative AI SDK (`@google/generative-ai`)
* Multer (File Uploads)
* JWT (Authentication)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone [https://github.com/EktaTiwari21/PersonalAssistant-App.git](https://github.com/EktaTiwari21/PersonalAssistant-App.git)
cd PersonalAssistant-App
````

### 2\. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd backend
npm install
```

**Create a `.env` file** in the `backend` folder with your secrets:

```env
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
```

Start the server:

```bash
npm run dev
```

*(Server runs on port 5000)*

### 3\. Frontend Setup

Open a new terminal, navigate to the frontend folder, and install dependencies:

```bash
cd ../frontend
npm install
```

**Important:** Update the `API_URL` in `app/login.tsx`, `app/register.tsx`, and `app/ChatScreen.tsx` to match your computer's local IPv4 address (e.g., `http://192.168.1.5:5000/api`).

Start the Expo app:

```bash
npm start
```

*(Press `a` to run on Android Emulator or scan the QR code with your phone)*

-----

## 📱 Usage

1.  **Register:** Create a new account.
2.  **Chat:** Ask questions like "Give me skincare tips" or "I'm feeling tired."
3.  **Voice:** Tap the microphone to speak your request.
4.  **Track:** Tap the "Drop" icon (🩸) to log your period. The AI will use this data to predict your next date.

## 🤝 Contributing

Feel free to fork this repository and submit pull requests.

*Developed by ***EKTA TIWARI***