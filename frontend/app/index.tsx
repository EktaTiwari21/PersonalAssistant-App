import React, { useState } from 'react';
import LoginScreen from './login';
import RegisterScreen from './register';
import ChatScreen from './ChatScreen';

export default function App() {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSuccess = (token: string) => {
    console.log("✅ App.tsx received Token:", token); // Debug Log
    setUserToken(token);
  };

  const handleLogout = () => {
    console.log("👋 Logging out...");
    setUserToken(null);
    setIsRegistering(false);
  };

  // THE TRAFFIC COP LOGIC
  if (userToken) {
    // 1. If logged in, show Chat
    return <ChatScreen onLogout={handleLogout} token={userToken} />;
  } else if (isRegistering) {
    // 2. If registering, show Register Screen
    return (
      <RegisterScreen
        onRegisterSuccess={handleLoginSuccess}
        onSwitchToLogin={() => setIsRegistering(false)}
      />
    );
  } else {
    // 3. Otherwise, show Login Screen
    return (
      <LoginScreen
        onLogin={handleLoginSuccess}
        onSwitchToRegister={() => setIsRegistering(true)}
      />
    );
  }
}