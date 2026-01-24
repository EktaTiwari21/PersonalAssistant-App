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
  ScrollView,
  Image,
  useWindowDimensions // <--- NEW: Helps us calculate screen size
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';

// ✅ YOUR VERCEL BACKEND URL
const API_URL = 'https://nova-backend-chi.vercel.app/api';

export default function LoginScreen() {
  const router = useRouter();
  const { height, width } = useWindowDimensions(); // Get screen size
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.replace('/ChatScreen');
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
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 20
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>

            {/* HEADERS */}
            <Text style={styles.title}>Hello, Beautiful!</Text>
            <Text style={styles.subtitle}>Your daily wellness partner is ready.</Text>

            {/* ILLUSTRATION (Responsive Size) */}
            <Image
              source={require('../assets/images/woman.png')}
              style={{
                width: width * 0.8,   // 80% of screen width
                height: height * 0.35, // 35% of screen height (Prevents it from being too tall)
                alignSelf: 'center',
                marginBottom: 20,
                marginTop: 10
              }}
              resizeMode="contain"
            />

            {/* FORM */}
            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <Ionicons name="mail-outline" size={24} color="#FFF" style={{ opacity: 0.7 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Email Address"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={24} color="#FFF" style={{ opacity: 0.7 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Password..."
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={22} color="rgba(255, 255, 255, 0.6)" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.8}>
                <View style={styles.button}>
                  {loading ? <ActivityIndicator color="#7352DD" /> : <Text style={styles.buttonText}>Sign In</Text>}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.linkButton} onPress={() => router.push('/register')}>
                <Text style={styles.linkText}>
                  New here? <Text style={styles.linkTextBold}>Create an account</Text>
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 42,
    color: '#F8F4F0',
    marginTop: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 5,
    textAlign: 'center',
    marginBottom: 10
  },
  formContainer: { width: '100%' },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    marginBottom: 15,
    paddingHorizontal: 15,
    height: 55,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    marginLeft: 10,
    height: '100%'
  },
  button: {
    backgroundColor: '#F8F4F0',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#7352DD',
    fontSize: 18,
    fontWeight: 'bold'
  },
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#F8F4F0', fontSize: 16 },
  linkTextBold: { fontWeight: 'bold', textDecorationLine: 'underline' },
});