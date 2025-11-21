import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Text, Alert } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, IMessage } from 'react-native-gifted-chat';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const USER = { _id: 1, name: 'User' };
const BOT = { _id: 2, name: 'Assistant', avatar: 'https://i.imgur.com/g0G0Y.png' };

const API_URL = 'http://10.0.2.2:5000/api';

interface ChatScreenProps {
  onLogout: () => void;
}

export default function ChatScreen({ onLogout }: ChatScreenProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    // Load Chat History
    fetch(`${API_URL}/chat`)
      .then((response) => response.json())
      .then((data) => {
        const formattedMessages = data.map((msg: any) => ({
          _id: msg._id,
          text: msg.text,
          createdAt: new Date(msg.createdAt),
          user: msg.isBot ? BOT : USER,
        }));
        setMessages(formattedMessages);
      })
      .catch((error) => console.error('Error loading history:', error));
  }, []);

  const handleLogPeriod = () => {
    Alert.alert(
      "Log Period",
      "Do you want to log today as the start of your period?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Log It",
          onPress: () => {
            fetch(`${API_URL}/period`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ startDate: new Date() }),
            })
            .then(res => {
              if (res.ok) {
                // Success: Show a confirmation Alert instead of a Push Notification
                Alert.alert("✅ Reminder Set", "I've logged your period. I'll remind you when the next one is expected!");
              } else {
                Alert.alert("Error", "Could not log period.");
              }
            })
            .catch(err => console.error(err));
          }
        }
      ]
    );
  };

  // --- Audio Recording Functions ---
  async function startRecording() {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
        setIsRecording(true);
      } else {
        Alert.alert("Permission denied", "We need microphone access to hear you!");
      }
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) return;
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);
    if (uri) uploadAudio(uri);
  }

  const uploadAudio = async (uri: string) => {
    setIsLoading(true);
    const tempId = uuidv4();
    const voiceMsg: IMessage = {
        _id: tempId,
        text: '🎤 [Sending Voice...]',
        createdAt: new Date(),
        user: USER,
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [voiceMsg]));

    const formData = new FormData();
    formData.append('audio', {
      uri: uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    } as any);

    try {
      const response = await fetch(`${API_URL}/chat/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });
      const data = await response.json();
      const botReply = {
        _id: uuidv4(),
        text: data.reply,
        createdAt: new Date(),
        user: BOT,
      };
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botReply]));
      Speech.speak(data.reply);
    } catch (error) {
      console.error("Upload failed", error);
      Alert.alert("Error", "Failed to process voice message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback((newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [userMessage]));
    setIsLoading(true);

    fetch(`${API_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage.text }),
    })
      .then((response) => response.json())
      .then((data) => {
        const botReply = {
          _id: uuidv4(),
          text: data.reply,
          createdAt: new Date(),
          user: BOT,
        };
        setMessages((previousMessages) => GiftedChat.append(previousMessages, [botReply]));
        Speech.speak(data.reply);
      })
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const renderFooter = () => {
    if (isLoading) return <View style={styles.footer}><ActivityIndicator size="small" color="#999" /></View>;
    return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
            <Text style={styles.headerTitle}>Assistant</Text>
            <TouchableOpacity onPress={onLogout}>
                <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.logButton} onPress={handleLogPeriod}>
          <Text style={styles.logButtonText}>🩸 Log Period</Text>
        </TouchableOpacity>
      </View>

      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: USER._id }}
        renderInputToolbar={(props) => (
            <View style={styles.inputContainer}>
                <InputToolbar
                    {...props}
                    containerStyle={styles.inputToolbar}
                    primaryStyle={{ alignItems: 'center' }}
                />
                <TouchableOpacity
                    style={[styles.micButton, isRecording && styles.micButtonRecording]}
                    onPress={isRecording ? stopRecording : startRecording}
                >
                    <Text style={styles.micText}>{isRecording ? "⬛" : "🎤"}</Text>
                </TouchableOpacity>
            </View>
        )}
        renderSend={(props) => <Send {...props} containerStyle={styles.sendButton} />}
        renderBubble={(props) => (
          <Bubble {...props}
            wrapperStyle={{ right: styles.userBubble, left: styles.botBubble }}
            textStyle={{ right: styles.userText, left: styles.botText }}
          />
        )}
        renderFooter={renderFooter}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E', paddingTop: Platform.OS === 'android' ? 40 : 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2C2C2E',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutText: { color: '#aaa', fontSize: 12, marginTop: 4 },
  logButton: { backgroundColor: '#FF4081', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  logButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: '#2C2C2E',
      paddingRight: 10,
  },
  inputToolbar: {
      flex: 1,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      paddingVertical: 8
  },
  micButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#373739',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      marginLeft: 5,
  },
  micButtonRecording: { backgroundColor: '#FF453A' },
  micText: { fontSize: 20 },
  sendButton: { justifyContent: 'center', alignItems: 'center', height: 40, width: 40, marginRight: 5 },
  userBubble: { backgroundColor: '#007AFF' },
  botBubble: { backgroundColor: '#373739' },
  userText: { color: '#FFFFFF' },
  botText: { color: '#EAEAEA' },
  footer: { padding: 10 },
});