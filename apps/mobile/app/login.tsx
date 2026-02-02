import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { createAPIClient } from '@studytree/shared';

const apiClient = createAPIClient(
  'http://localhost:8000',  // Change to your server IP for device testing
  'http://localhost:8001'
);

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: async () => {
      const tokens = await apiClient.login({ username, password });
      return tokens;
    },
    onSuccess: async (tokens) => {
      await SecureStore.setItemAsync('auth_tokens', JSON.stringify(tokens));
      router.replace('/trees');
    },
    onError: () => {
      Alert.alert('Error', 'Invalid credentials. Please try again.');
    },
  });

  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    loginMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Tree</Text>
      
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.button, loginMutation.isPending && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loginMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.note}>
          Note: Update API URLs in login.tsx for device testing
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 40,
    color: '#333',
  },
  form: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#0066cc',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  note: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
  },
});
