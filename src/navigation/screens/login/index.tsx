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
import { styles } from './styles';
import { emailRegex, validateLogin } from '../../../utils/validations';
import { login } from '../../../services/auth.service';
import { APP_VERSION, DEFAULT_BUS_ID } from '../../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useGoogleLogin } from '../../../services/google-auth.service';
import { RootStackParamList } from '../app-navigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    startGoogleLogin,
    isLoading: isGoogleLoading,
    request,
  } = useGoogleLogin({
    onSuccess: (googleUser) => {
      const userId = (googleUser as any)?.uid || (googleUser as any)?.id || 'userError';

      const busId = DEFAULT_BUS_ID;

      navigation.replace('BusOverview', {
        userId,
        busId,
      });
    },
    onError: setError,
  });

  const handleLogin = async () => {
    const validationError = validateLogin(email, password);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const resp = await login(email.trim(), password);

      const userId = resp.user.id;
      const busId = DEFAULT_BUS_ID;

      navigation.replace('BusOverview', {
        userId,
        busId,
      });
    } catch (e: any) {
      const message = e?.message || 'Não foi possível fazer login. Tente novamente.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const isAnyLoading = isLoading || isGoogleLoading;

  return (
    <ImageBackground
      source={require('../../../assets/images/little-ghost-logo.png')}
      resizeMode="cover"
      style={styles.bg}
      imageStyle={styles.bgImage}
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <View style={styles.header}></View>

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
        </View>

        <Pressable
          onPress={handleLogin}
          disabled={isAnyLoading}
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && !isAnyLoading ? styles.primaryButtonPressed : null,
            isAnyLoading ? styles.primaryButtonDisabled : null,
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

          <View style={styles.divider} />
        </View>

        {/* <Pressable
          onPress={startGoogleLogin}
          disabled={!request || isAnyLoading}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed ? styles.secondaryButtonPressed : null,
          ]}
          accessibilityRole="button"
        >
          {isGoogleLoading ? (
            <ActivityIndicator accessibilityLabel="Entrando com Google" />
          ) : (
            <Text style={styles.secondaryButtonText}>Continuar com Google</Text>
          )}
        </Pressable> */}

        <View style={styles.signupRow}>
          <Text style={styles.signupText}>Ainda não tem conta?</Text>
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupLink}> Cadastre-se</Text>
          </Pressable>
        </View>

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
