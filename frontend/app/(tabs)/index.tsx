import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';

// --- THIS IS THE FIX (Line 1) ---
// We import GiftedChat as the default, and Bubble/Send/InputToolbar as named imports
import GiftedChat, {
  Bubble,
  Send,
  InputToolbar,
  IMessage,
} from 'react-native-gifted-chat';
// --- END FIX ---

import 'react-native-get-random-values'; // Import for uuid
import { v4 as uuidv4 } from 'uuid';

// Define the shape of a chat message
interface ChatMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: string | number;
    name: string;
    avatar?: string;
  };
}

// Define our user and bot
const USER = {
  _id: 1,
  name: 'User',
};

const BOT = {
  _id: 2,
  name: 'Assistant',
  avatar: 'https://i.imgur.com/g0G0Y.png',
};

// This is the URL of your backend server
const BACKEND_URL = 'http://127.0.0.1:5001/api/chat';


export default function Chatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false); // For loading indicator

  // Add the initial welcome message
  useEffect(() => {
    setMessages([
      {
        _id: uuidv4(),
        text: 'Hello! I am your personal assistant. How can I help you today?',
        createdAt: new Date(),
        user: BOT,
      },
    ]);
  }, []);

  const handleSend = useCallback((newMessages: ChatMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, [userMessage])
    );
    setIsLoading(true);

    fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage.text,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        const botReply: ChatMessage = {
          _id: uuidv4(),
          text: data.reply,
          createdAt: new Date(),
          user: BOT,
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [botReply])
        );
      })
      .catch((error) => {
        console.error('Error fetching from backend:', error);
        const errorMsg: ChatMessage = {
          _id: uuidv4(),
          text: 'Sorry, I am having trouble connecting. Please try again.',
          createdAt: new Date(),
          user: BOT,
        };
        setMessages((previousMessages) =>
          GiftedChat.append(previousMessages, [errorMsg])
        );
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const renderFooter = () => {
    if (isLoading) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      );
    }
    return null;
  };

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages as IMessage[]}
        onSend={(newMessages) => handleSend(newMessages as ChatMessage[])}
        user={{
          _id: USER._id,
        }}
        // --- THIS IS THE FIX (Lines 2-4) ---
        // We now use the components we imported directly
        renderInputToolbar={(props) => (
          <InputToolbar {...props} containerStyle={styles.inputToolbar} />
        )}
        renderSend={(props) => (
          <Send {...props} containerStyle={styles.sendButton} />
        )}
        renderBubble={(props) => {
          return (
            <Bubble
              {...props}
              wrapperStyle={{
                right: styles.userBubble,
                left: styles.botBubble,
              }}
              textStyle={{
                right: styles.userText,
                left: styles.botText,
              }}
            />
          );
        }}
        // --- END FIX ---
        renderAvatarOnTop={true}
        renderFooter={renderFooter}
      />
    </View>
  );
}

// --- STYLES ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E', // Dark background color
  },
  inputToolbar: {
    backgroundColor: '#2C2C2E', // Slightly lighter dark shade for input
    borderTopWidth: 0,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  sendButton: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    width: 40,
    marginRight: 5,
  },
  userBubble: {
    backgroundColor: '#007AFF', // Standard blue for user
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 5,
  },
  botBubble: {
    backgroundColor: '#373739', // Dark gray for bot
    borderBottomRightRadius: 15,
    borderBottomLeftRadius: 15,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 15,
  },
  userText: {
    color: '#FFFFFF', // White text for user
    fontSize: 16,
  },
  botText: {
    color: '#EAEAEA', // Light gray text for bot
    fontSize: 16,
  },
  footer: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});