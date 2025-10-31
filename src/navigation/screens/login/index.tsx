import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import {styles} from './styles'
import { emailRegex, validateLogin } from './validations';
import { login } from '../../../services/auth.service';
import { APP_VERSION } from '../../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;


export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
     navigation.replace('Maps')
    } catch (e: any) {
      const message = e?.message || 'Não foi possível fazer login. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/images/fantasminha.png')}
      resizeMode="cover"
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Entrar</Text>
          <Text style={styles.subtitle}>
            Acesse sua conta para acompanhar os ônibus em tempo real.
          </Text>
        </View>

        {error ? (
          <View accessibilityRole="alert" style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

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
            style={[
              styles.input,
              error && !emailRegex.test(email || ' ') ? styles.inputError : null,
            ]}
            accessibilityLabel="Campo de e-mail"
            returnKeyType="next"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Senha</Text>
          <View style={styles.passwordRow}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              textContentType="password"
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="••••••••"
              placeholderTextColor="#9aa0a6"
              style={[styles.input, styles.passwordInput]}
              accessibilityLabel="Campo de senha"
              returnKeyType="go"
              onSubmitEditing={handleLogin}
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
          <Pressable
            onPress={() =>
              Alert.alert('Recuperar senha', 'Implementar fluxo de recuperação.')
            }
            hitSlop={8}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={isLoading}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isLoading ? styles.primaryButtonPressed : null,
            isLoading ? styles.primaryButtonDisabled : null,
          ]}
        >
          {isLoading ? (
            <ActivityIndicator accessibilityLabel="Entrando" />
          ) : (
            <Text style={styles.primaryButtonText}>Entrar</Text>
          )}
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.divider} />
        </View>

        <Pressable
          onPress={() => Alert.alert('Login com Google', 'Implementar login social.')}
          style={({ pressed }) => [styles.secondaryButton, pressed ? styles.secondaryButtonPressed : null]}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>Continuar com Google</Text>
        </Pressable>

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Ainda não tem conta?</Text>
          <Pressable onPress={() =>  Alert.alert('Ainda não tem conta', 'Implementar Cadastro.')}>
            <Text style={styles.signupLink}> Cadastre-se</Text>
          </Pressable>
        </View>

        <Text accessible accessibilityLabel={`Versão do app ${APP_VERSION}`} style={styles.version}>
          v{APP_VERSION}
        </Text>
      </View>
    </ImageBackground>
  );
}

