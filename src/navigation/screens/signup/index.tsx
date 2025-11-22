import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';

import { styles } from './styles';
import { signup } from '../../../services/auth.service';
import { APP_VERSION, DEFAULT_BUS_ID } from '../../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../app-navigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAnyLoading = isLoading; // mantém mesma ideia do Login

  async function handleSignup() {
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const resp = await signup(email.trim(), password.trim());
      const userId = resp.user.id;
      const busId = DEFAULT_BUS_ID;

      navigation.replace('BusOverview', {
        userId,
        busId,
      });
    } catch (e: any) {
      setError(e.message || 'Não foi possível criar sua conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require('../../../assets/images/little-ghost-logo.png')}
      resizeMode="cover"
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        {/* 👇 Mesmo header vazio do Login, só pra manter o espaçamento/ghost igual */}
        <View style={styles.header} />

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* E-MAIL */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>E-mail</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            placeholder="seuemail@exemplo.com"
            placeholderTextColor="#9aa0a6"
            style={styles.input}
            accessibilityLabel="Campo de e-mail"
            returnKeyType="next"
          />
        </View>

        {/* SENHA + BOTÃO MOSTRAR/OCULTAR */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry={!showPassword}
              textContentType="password"
              placeholder="••••••••"
              placeholderTextColor="#9aa0a6"
              style={[styles.input, styles.passwordInput]}
              accessibilityLabel="Campo de senha"
              returnKeyType="go"
              onSubmitEditing={handleSignup}
            />
            <Pressable
              onPress={() => setShowPassword((s) => !s)}
              accessibilityRole="button"
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              style={styles.eyeButton}
            >
              <Text style={styles.eyeText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
            </Pressable>
          </View>
        </View>

        {/* BOTÃO CRIAR CONTA */}
        <Pressable
          onPress={handleSignup}
          disabled={isAnyLoading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isAnyLoading ? styles.primaryButtonPressed : null,
            isAnyLoading ? styles.primaryButtonDisabled : null,
          ]}
          accessibilityRole="button"
        >
          {isLoading ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.primaryButtonText}>Criar conta</Text>
          )}
        </Pressable>

        {/* Mesma “linha vazia” do Login (sem texto “ou”) */}
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <View style={styles.divider} />
        </View>

        {/* Link invertido em relação ao Login */}
        <Pressable onPress={() => navigation.navigate('Login')} style={styles.signupRow}>
          <Text style={styles.signupText}>Já tem conta?</Text>
          <Text style={styles.signupLink}> Fazer login</Text>
        </Pressable>

        <Text
          accessible
          accessibilityLabel={`Versão do app ${APP_VERSION}`}
          style={styles.version}
        >
          v{APP_VERSION}
        </Text>
      </View>
    </ImageBackground>
  );
}
