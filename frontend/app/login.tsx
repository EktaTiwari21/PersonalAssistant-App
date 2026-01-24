import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';

// ⚠️ CHECK YOUR IP ADDRESS
const API_URL = 'https://nova-backend-chi.vercel.app/api';

interface LoginProps {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        onLogin(data.token);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) {
    return <ActivityIndicator />;
  }

  return (
    <LinearGradient
      colors={['#7352DD', '#AB91EA', '#9187E0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >

        {/* HEADER */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Hello, Beautiful!</Text>
          <Text style={styles.subtitle}>Your daily wellness partner is ready.</Text>

          {/* --- THE FIX: USING THE IMAGE FILE --- */}
          {/* Make sure you put your exported 'woman.png' into the assets folder! */}
          <Image
            source={require('../assets/images/woman.png')}
            style={styles.illustration}
            resizeMode="contain"
          />
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>

          {/* Email */}
          <View style={styles.inputWrapper}>
             <Ionicons name="mail-outline" size={24} color="#FFF" style={{opacity: 0.7}} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="rgba(255,255,255, 0.6)"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={24} color="#FFF" style={{opacity: 0.7}} />
            <TextInput
              style={styles.input}
              placeholder="Password..."
              placeholderTextColor="rgba(255,255,255, 0.6)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="rgba(255,255,255, 0.6)"
              />
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
            <View style={styles.button}>
              {loading ? (
                <ActivityIndicator color="#7352DD" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </View>
          </TouchableOpacity>

          {/* Footer */}
          <TouchableOpacity style={styles.linkButton} onPress={onSwitchToRegister}>
            <Text style={styles.linkText}>
              New here? <Text style={styles.linkTextBold}>Create an account</Text>
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 30 },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 40,
  },
  title: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 42,
    color: '#F8F4F0',
    textAlign: 'center',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255,255,255, 0.9)',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '300'
  },

  // FIXED ILLUSTRATION STYLE
  illustration: {
    width: 280,   // Adjust width to match your design
    height: 280,  // Adjust height to match your design
    marginTop: 20,
  },

  formContainer: { width: '100%' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(145, 135, 224, 0.47)',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginBottom: 20,
    paddingHorizontal: 15,
    height: 55,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    height: '100%'
  },

  button: {
    backgroundColor: '#EBE2E0',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#6C63FF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#7352DD',
    fontSize: 20,
    fontWeight: 'bold',
  },

  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#EBE2E0', fontSize: 16 },
  linkTextBold: { color: '#FFF', fontWeight: 'bold', textDecorationLine: 'underline' },
});