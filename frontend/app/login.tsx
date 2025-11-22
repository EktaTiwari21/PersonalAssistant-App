import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// UPDATE THIS IP if needed!
const API_URL = 'http://192.168.29.49:5000/api/users';

interface LoginProps {
  onLogin: (token: string) => void;
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    console.log(`Attempting login to: ${API_URL}/login`); // Debug Log

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login Response:", data); // Debug Log

      if (response.ok) {
        console.log("Login Success! Token:", data.token); // Debug Log
        onLogin(data.token);
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error("Network Error:", error); // Debug Log
      Alert.alert('Error', 'Could not connect to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back! (v2) 👋</Text>
      <Text style={styles.subtitle}>Sign in to your personal assistant</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#666"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              placeholderTextColor="#666"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={24}
                    color="#aaa"
                />
            </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.linkButton} onPress={onSwitchToRegister}>
        <Text style={styles.linkText}>Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text></Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'center', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#aaa', marginBottom: 40 },
  inputContainer: { marginBottom: 20 },
  label: { color: '#ccc', marginBottom: 8, fontSize: 14 },
  input: { backgroundColor: '#2C2C2E', color: '#fff', padding: 15, borderRadius: 10, borderWidth: 1, borderColor: '#333', fontSize: 16 },
  passwordWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E', borderRadius: 10, borderWidth: 1, borderColor: '#333', paddingHorizontal: 15 },
  passwordInput: { flex: 1, color: '#fff', paddingVertical: 15, fontSize: 16 },
  eyeIcon: { marginLeft: 10 },
  button: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkButton: { marginTop: 20, alignItems: 'center' },
  linkText: { color: '#aaa', fontSize: 14 },
  linkTextBold: { color: '#007AFF', fontWeight: 'bold' },
});