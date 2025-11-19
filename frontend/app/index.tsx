import React, { useState } from 'react';
import LoginScreen from './login';
import ChatScreen from './ChatScreen';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);

  const handleLoginSuccess = (token: string) => {
    setUserToken(token);
  };

  // --- NEW: Handle Logout ---
  const handleLogout = () => {
    setUserToken(null); // Clear the token to go back to login
  };

  // THE SWITCH
  if (userToken) {
    // Pass the logout function to the chat screen
    return <ChatScreen onLogout={handleLogout} />;
  } else {
    return <LoginScreen onLogin={handleLoginSuccess} />;
  }
}