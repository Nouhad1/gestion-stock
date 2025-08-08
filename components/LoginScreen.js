import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons'; // expo install @expo/vector-icons
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!login || !password) {
      Alert.alert('Erreur', 'Veuillez saisir votre login et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('https://9a1123bcdc46.ngrok-free.app/api/login', {
        login,
        mot_de_passe: password,
      });

      if (response.data.message === 'Connexion réussie') {
        Alert.alert('Succès', response.data.message);
        await AsyncStorage.setItem('userToken', JSON.stringify(response.data.user));
        navigation.replace('Main');
      } else {
        Alert.alert('Erreur', response.data.message || "Échec de l'authentification.");
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      if (error.response) {
        Alert.alert('Erreur', error.response.data.message || 'Erreur serveur.');
      } else if (error.request) {
        Alert.alert('Erreur réseau', 'Le serveur est injoignable.');
      } else {
        Alert.alert('Erreur', 'Une erreur inconnue est survenue.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Entête fixe avec logo + nom société */}
      <View style={styles.headerContainer}>
        <Image source={require('../assets/logo-modified.png')} style={styles.logo} />
        <Text style={styles.companyName}>Bluestrek</Text>
      </View>

      {/* Formulaire */}
      <KeyboardAvoidingView
        style={{ flex: 1, width: '100%' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Connexion</Text>

          <TextInput
            style={styles.input}
            placeholder="Login"
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mot de passe"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons name={secure ? 'eye-off' : 'eye'} size={24} color="#888" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  companyName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1d4ed8',
  },
  formContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  passwordContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#007bff',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
