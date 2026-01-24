import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Text,
  Alert,
  Image,
  StatusBar
} from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, IMessage } from 'react-native-gifted-chat';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
const USER = { _id: 1, name: 'User' };
const BOT = {
  _id: 2,
  name: 'Nova',
  avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg'
};

// ⚠️ CHECK YOUR IP!
const API_URL = 'https://nova-backend-chi.vercel.app/api';

// --- THEME COLORS (Midnight Matte) ---
const THEME = {
  background: '#121212',       // Deep Charcoal (Easy on eyes)
  textPrimary: '#E5E5EA',      // Off-White (No glare)
  textSecondary: '#A1A1AA',    // Light Grey
  userBubble: '#3A6D8C',       // Muted Slate Blue
  botBubble: '#2C2C2E',        // Dark Grey
  inputBackground: '#1C1C1E',  // Slightly lighter than bg
  accent: '#D8B4FE',           // Soft Lavender (Icons)
  danger: '#CF6679',           // Soft Red
};

interface ChatScreenProps {
  onLogout: () => void;
  token: string;
}

export default function ChatScreen({ onLogout, token }: ChatScreenProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setMessages([]);

    fetch(`${API_URL}/chat`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
            const formattedMessages = data.map((msg: any) => ({
            _id: msg._id,
            text: msg.text,
            createdAt: new Date(msg.createdAt),
            user: msg.isBot ? BOT : USER,
            }));
            setMessages(formattedMessages.reverse());
        }
      })
      .catch((error) => console.error('Error loading history:', error));
  }, [token]);

  // --- SPEECH LOGIC ---
  const speakText = (text: string) => {
    if (isMuted) return;
    const LIMIT = 3900;
    const textToSpeak = text.length > LIMIT ? text.substring(0, LIMIT) : text;
    Speech.speak(textToSpeak);
  };

  const toggleMute = () => {
      if (isMuted) {
          setIsMuted(false);
          Alert.alert("Voice On", "I will read replies out loud.");
      } else {
          Speech.stop();
          setIsMuted(true);
      }
  };

  // --- ACTIONS ---
  const handleLogPeriod = () => {
    Alert.alert(
      "Log Period",
      "Log today as start of your cycle?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Log It",
          onPress: () => {
            handleSend([{
                _id: uuidv4(),
                text: "I want to log my period today.",
                createdAt: new Date(),
                user: USER
            }]);

            fetch(`${API_URL}/period`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ startDate: new Date() }),
            });
          }
        }
      ]
    );
  };

  // --- AUDIO RECORDING ---
  async function startRecording() {
    Speech.stop();
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(recording);
        setIsRecording(true);
      } else {
        Alert.alert("Permission denied", "We need microphone access!");
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
        text: '🎤 [Voice Message]',
        createdAt: new Date(),
        user: USER,
    };
    setMessages((previousMessages) => GiftedChat.append(previousMessages, [voiceMsg]));

    const formData = new FormData();
    formData.append('audio', { uri: uri, name: 'recording.m4a', type: 'audio/m4a' } as any);

    try {
      const response = await fetch(`${API_URL}/chat/voice`, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();
      if (!response.ok || !data.reply) throw new Error("Voice failed");

      const botReply = { _id: uuidv4(), text: data.reply, createdAt: new Date(), user: BOT };
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botReply]));
      speakText(data.reply);

    } catch (error) {
      Alert.alert("Error", "Failed to process voice.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SEND MESSAGE ---
  const handleSend = useCallback((newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((prev) => GiftedChat.append(prev, [userMessage]));
    setIsLoading(true);
    Speech.stop();

    fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ message: userMessage.text }),
    }).then(r => r.json()).then(d => {
        if (d.reply) {
            const botReply = { _id: uuidv4(), text: d.reply, createdAt: new Date(), user: BOT };
            setMessages(p => GiftedChat.append(p, [botReply]));
            speakText(d.reply);
        }
    }).catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, [isMuted, token]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      {/* --- HEADER (Clean & Dark) --- */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Image source={{ uri: BOT.avatar }} style={styles.headerAvatar} />
            <View>
                <Text style={styles.headerTitle}>Nova</Text>
                <Text style={styles.headerSubtitle}>Always online</Text>
            </View>
        </View>

        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={toggleMute}>
                <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={22} color={isMuted ? THEME.danger : THEME.textPrimary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogPeriod}>
                <Ionicons name="water" size={22} color="#FF4081" />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.iconButton, styles.logoutButton]} onPress={onLogout}>
                <Ionicons name="power" size={22} color={THEME.textPrimary} />
            </TouchableOpacity>
        </View>
      </View>

      {/* --- CHAT AREA --- */}
      <GiftedChat
        messages={messages}
        onSend={handleSend}
        user={{ _id: USER._id }}
        textInputStyle={{ color: THEME.textPrimary }} // Off-white input text

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
                    <Ionicons name="mic" size={24} color="#FFF" />
                </TouchableOpacity>
            </View>
        )}
        renderSend={(props) => (
            <Send {...props} containerStyle={styles.sendButton}>
                <View style={styles.sendIconView}>
                    <Ionicons name="send" size={18} color="white" />
                </View>
            </Send>
        )}
        renderBubble={(props) => (
          <Bubble {...props}
            wrapperStyle={{
                right: { backgroundColor: THEME.userBubble, marginBottom: 5 },
                left: { backgroundColor: THEME.botBubble, borderColor: '#333', borderWidth: 1, marginBottom: 5 }
            }}
            textStyle={{
                right: { color: '#FFF' },
                left: { color: THEME.textPrimary }
            }}
          />
        )}
        renderFooter={() => isLoading ? <View style={{padding: 10}}><ActivityIndicator size="small" color={THEME.accent}/></View> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 50 : 20,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: THEME.background,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  headerTitle: { color: THEME.textPrimary, fontSize: 17, fontWeight: 'bold' },
  headerSubtitle: { color: THEME.textSecondary, fontSize: 11 },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconButton: {
      marginLeft: 10,
      padding: 8,
      backgroundColor: '#1C1C1E',
      borderRadius: 20,
      width: 38,
      height: 38,
      justifyContent: 'center',
      alignItems: 'center'
  },
  logoutButton: { backgroundColor: '#2C2C2E' },

  // Input Styles
  inputContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      backgroundColor: THEME.inputBackground,
      marginHorizontal: 15,
      marginBottom: 10,
      borderRadius: 25,
      paddingRight: 5,
      borderWidth: 1,
      borderColor: '#333',
  },
  inputToolbar: {
      flex: 1,
      backgroundColor: 'transparent',
      borderTopWidth: 0,
      paddingVertical: 5,
      paddingLeft: 10,
  },
  micButton: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: '#333', justifyContent: 'center', alignItems: 'center',
      marginBottom: 4, marginRight: 5
  },
  micButtonRecording: { backgroundColor: THEME.danger },

  sendButton: { justifyContent: 'center', alignItems: 'center', height: 44, width: 44 },
  sendIconView: {
      width: 36, height: 36, borderRadius: 18,
      backgroundColor: THEME.userBubble, justifyContent: 'center', alignItems: 'center',
      marginBottom: 4
  },
});