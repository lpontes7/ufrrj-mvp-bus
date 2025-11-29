import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  ImageBackground,
  Modal,
  ScrollView,
} from 'react-native';

import { styles } from './styles';
import { signup } from '../../../services/auth.service';
import { APP_VERSION, DEFAULT_BUS_ID } from '../../../utils/constants';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../app-navigator';
import { TermsContent } from '@/src/components/terms/terms-content';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export default function SignupScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const isAnyLoading = isLoading;

  // Primeiro passo: validar e abrir o modal de termos
  // First step: validate and open the terms modal
  function handleOpenTerms() {
    if (!email || !password) {
      setError('Preencha todos os campos.');
      return;
    }

    // aqui você pode fazer validação básica de e-mail/senha se quiser
    // you can add basic email/password validation here if you want

    setError(null);
    setShowTermsModal(true);
  }

  // Segundo passo: usuário aceitou os termos → faz o cadastro de fato
  // Second step: user accepted the terms → actually perform sign-up
  async function handleAcceptTermsAndSignup() {
    setIsLoading(true);
    setError(null);

    try {
      const resp = await signup(email.trim(), password.trim());
      const userId = resp.user.id;
      const busId = DEFAULT_BUS_ID;

      setShowTermsModal(false);

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

  // Usuário não aceitou os termos
  // User did not accept the terms
  function handleDeclineTerms() {
    setShowTermsModal(false);
    setError(
      'Para criar uma conta, é necessário aceitar os Termos de Uso e a Política de Privacidade.',
    );
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
              onSubmitEditing={handleOpenTerms}
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

        {/* BOTÃO CRIAR CONTA – agora só abre o modal */}
        {/* CREATE ACCOUNT BUTTON – now it only opens the modal */}
        <Pressable
          onPress={handleOpenTerms}
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

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <View style={styles.divider} />
        </View>

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

      {/* MODAL DE TERMOS DE USO E POLÍTICA DE PRIVACIDADE */}
      {/* TERMS OF USE & PRIVACY POLICY MODAL */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent
        onRequestClose={() => {
          if (!isAnyLoading) {
            handleDeclineTerms();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Termos de Uso e Política de Privacidade</Text>

            <ScrollView style={styles.modalBody}>
              <TermsContent />
            </ScrollView>

            <View style={styles.modalButtonsRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleDeclineTerms}
                disabled={isAnyLoading}
              >
                <Text style={styles.modalButtonSecondaryText}>Não aceito</Text>
              </Pressable>

              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleAcceptTermsAndSignup}
                disabled={isAnyLoading}
              >
                {isLoading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.modalButtonPrimaryText}>Li e aceito</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}
