import React, { useEffect, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  Alert,
} from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

// Necessário para fechar o browser após o redirect do OAuth
WebBrowser.maybeCompleteAuthSession();

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined;
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID || undefined;
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS || undefined;
const isConfigured = !!webClientId;

interface Props {
  label?: string;
}

export default function GoogleSignInButton({ label = 'Continuar com Google' }: Props) {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId,
    androidClientId,
    iosClientId,
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      if (id_token) {
        setLoading(true);
        signInWithGoogle(id_token)
          .then(() => router.replace('/(tabs)'))
          .catch((error: Error) => {
            Alert.alert('Erro', error.message || 'Não foi possível entrar com Google.');
          })
          .finally(() => setLoading(false));
      }
    } else if (response?.type === 'error') {
      Alert.alert('Erro', 'Autenticação com Google cancelada ou falhou.');
    }
  }, [response]);

  const handlePress = () => {
    if (!isConfigured) {
      Alert.alert(
        'Google Sign-In não configurado',
        'Para usar o login com Google, adicione o EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID no arquivo .env.\n\nObtemos no Firebase Console → Authentication → Google → Web client ID.',
        [{ text: 'Entendido' }]
      );
      return;
    }
    promptAsync();
  };

  return (
    <TouchableOpacity
      style={[styles.button, loading && styles.buttonLoading]}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#1F2937" size="small" />
      ) : (
        <View style={styles.inner}>
          <View style={styles.googleLogo}>
            <Text style={styles.googleLogoBlue}>G</Text>
          </View>
          <Text style={styles.text}>{label}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  buttonLoading: {
    opacity: 0.6,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  googleLogo: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  googleLogoBlue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
});

});
