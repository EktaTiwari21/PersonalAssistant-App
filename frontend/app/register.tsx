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
  ScrollView,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';

// ⚠️ CHECK YOUR IP ADDRESS
const API_URL = 'http://192.168.29.49:5000/api/users';

interface RegisterProps {
  onRegisterSuccess: (token: string) => void;
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onSwitchToLogin }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Load the "Start your journey" font
  let [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        onRegisterSuccess(data.token);
      } else {
        Alert.alert('Registration Failed', data.message || 'Something went wrong');
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
      // YOUR DESIGN GRADIENT
      colors={['#7352DD', '#AB91EA', '#9187E0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* HEADER & ILLUSTRATION */}
          <View style={styles.header}>
            <Text style={styles.title}>Start your journey.</Text>
            <Text style={styles.subtitle}>Create your personal wellness space.</Text>

            {/* YOUR SIGNUP IMAGE */}
            <Image
              source={require('../assets/images/signup.png')}
              style={styles.illustration}
              resizeMode="contain"
            />
          </View>

          {/* FORM */}
          <View style={styles.formContainer}>

            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={24} color="#FFF" style={{opacity: 0.6}} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={24} color="#FFF" style={{opacity: 0.6}} />
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

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={24} color="#FFF" style={{opacity: 0.6}} />
              <TextInput
                style={styles.input}
                placeholder="Create Password"
                placeholderTextColor="rgba(255, 255, 255, 0.6)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="rgba(255, 255, 255, 0.6)"
                />
              </TouchableOpacity>
            </View>

            {/* Create Account Button */}
            <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
              <View style={styles.button}>
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </View>
            </TouchableOpacity>

            {/* Footer Link */}
            <TouchableOpacity style={styles.linkButton} onPress={onSwitchToLogin}>
              <Text style={styles.linkText}>
                Already have an account? <Text style={styles.linkTextBold}>Sign In</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40
  },

  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  title: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 40,
    color: '#F8F4F0',
    textAlign: 'center',
    marginBottom: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 10
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 0,
    textAlign: 'center',
    marginBottom: 10
  },
  illustration: {
    width: 250,
    height: 200, // Adjusted height to fit form nicely
    marginTop: 10
  },

  formContainer: { width: '100%' },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    // Matches your CSS: rgba(115, 82, 221, 0.45)
    backgroundColor: 'rgba(115, 82, 221, 0.45)',
    borderRadius: 20,
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
    // Matches your CSS: rgba(115, 82, 221, 0.80)
    backgroundColor: 'rgba(115, 82, 221, 0.80)',
    paddingVertical: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#7CC5FB', // Your light blue border
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '400', // Matches 'Ovo' weight
  },

  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#F8F4F0', fontSize: 16 },
  linkTextBold: { color: '#7352DD', fontWeight: 'bold', textDecorationLine: 'underline'},
});