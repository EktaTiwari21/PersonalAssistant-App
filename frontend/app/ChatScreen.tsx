import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform, TouchableOpacity, Text, Alert, Image, StatusBar } from 'react-native';
import { GiftedChat, Bubble, Send, InputToolbar, IMessage } from 'react-native-gifted-chat';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

// --- CONFIGURATION ---
const USER = { _id: 1, name: 'User' };
const BOT = {
  _id: 2,
  name: 'Nova',
  avatar: 'https://img.freepik.com/free-vector/graident-ai-robot-vectorart_78370-4114.jpg'
};

// Use your IP address!
const API_URL = 'http://192.168.29.49:5000/api';

interface ChatScreenProps {
  onLogout: () => void;
  token: string;
}

export default function ChatScreen({ onLogout, token }: ChatScreenProps) {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
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
            setMessages(formattedMessages);
        }
      })
      .catch((error) => console.error('Error loading history:', error));
  }, []);

  // --- NEW: Safe Speech Function ---
  const speakText = (text: string) => {
    // Android crashes if text is > 4000 chars.
    // We limit it to 3900 to be safe.
    const LIMIT = 3900;
    if (text.length > LIMIT) {
        console.log("Speech too long, truncating...");
        Speech.speak(text.substring(0, LIMIT));
    } else {
        Speech.speak(text);
    }
  };
  // --------------------------------

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
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ startDate: new Date() }),
            })
            .then(res => {
              if (res.ok) {
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
        text: '🎤 [Voice Message]',
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
        headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.reply) {
        console.log("Backend Error or No Reply:", data);
        Alert.alert("Voice Error", "I couldn't process that audio. Please try again.");
        return;
      }

      const botReply = {
        _id: uuidv4(),
        text: data.reply,
        createdAt: new Date(),
        user: BOT,
      };
      setMessages((previousMessages) => GiftedChat.append(previousMessages, [botReply]));

      // Use our safe helper instead of Speech.speak directly
      speakText(data.reply);

    } catch (error) {
      console.error("Upload failed", error);
      Alert.alert("Error", "Failed to process voice message.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = useCallback((newMessages: IMessage[] = []) => {
    const userMessage = newMessages[0];
    setMessages((prev) => GiftedChat.append(prev, [userMessage]));
    setIsLoading(true);

    fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage.text }),
    }).then(r => r.json()).then(d => {
        if (d.reply) {
            const botReply = { _id: uuidv4(), text: d.reply, createdAt: new Date(), user: BOT };
            setMessages(p => GiftedChat.append(p, [botReply]));

            // Use our safe helper here too!
            speakText(d.reply);
        }
    }).catch((error) => console.error(error))
      .finally(() => setIsLoading(false));
  }, []);

  const renderFooter = () => {
    if (isLoading) return <View style={styles.footer}><ActivityIndicator size="small" color="#FFF" /></View>;
    return null;
  };

  // --- UI RENDER ---
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#232526', '#414345']} style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
            <Image source={{ uri: BOT.avatar }} style={styles.headerAvatar} />
            <View><Text style={styles.headerTitle}>Nova</Text><Text style={styles.headerSubtitle}>Always online</Text></View>
        </View>
        <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton} onPress={handleLogPeriod}><Text style={styles.iconText}>🩸</Text></TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={onLogout}><Text style={styles.iconText}>🚪</Text></TouchableOpacity>
        </View>
      </View>
      <GiftedChat messages={messages} onSend={handleSend} user={{ _id: USER._id }} renderFooter={renderFooter}
        renderInputToolbar={(props) => (
            <View style={styles.inputContainer}>
                <InputToolbar {...props} containerStyle={styles.inputToolbar} primaryStyle={{ alignItems: 'center' }} />
                <TouchableOpacity style={[styles.micButton, isRecording && styles.micButtonRecording]} onPress={isRecording ? stopRecording : startRecording}>
                    <Text style={styles.micText}>{isRecording ? "⬛" : "🎤"}</Text>
                </TouchableOpacity>
            </View>
        )}
        renderSend={(props) => <Send {...props} containerStyle={styles.sendButton}><View style={styles.sendIconView}><Text style={{color: 'white'}}>➤</Text></View></Send>}
        renderBubble={(props) => <Bubble {...props} wrapperStyle={{right: styles.userBubble, left: styles.botBubble}} textStyle={{right: { color: '#FFF' }, left: { color: '#EAEAEA' }}} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Platform.OS === 'android' ? 50 : 20, paddingBottom: 20, paddingHorizontal: 20, backgroundColor: 'rgba(255,255,255,0.1)', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10, borderWidth: 2, borderColor: '#00C6FF' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { color: '#00C6FF', fontSize: 12 },
  headerRight: { flexDirection: 'row' },
  iconButton: { marginLeft: 15, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 },
  iconText: { fontSize: 18 },
  inputContainer: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: '#1e1e1e', marginHorizontal: 10, marginBottom: 10, borderRadius: 25, paddingRight: 5, borderWidth: 1, borderColor: '#333' },
  inputToolbar: { flex: 1, backgroundColor: 'transparent', borderTopWidth: 0, paddingVertical: 5, paddingLeft: 10 },
  micButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 4, marginRight: 5 },
  micButtonRecording: { backgroundColor: '#FF453A' },
  micText: { fontSize: 20 },
  sendButton: { justifyContent: 'center', alignItems: 'center', height: 44, width: 44 },
  sendIconView: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#007AFF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  userBubble: { backgroundColor: '#007AFF', borderBottomRightRadius: 0, padding: 5 },
  botBubble: { backgroundColor: '#333', borderBottomLeftRadius: 0, padding: 5 },
  footer: { padding: 10 },
});