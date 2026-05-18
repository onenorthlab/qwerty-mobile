import { useState } from 'react';
import { View, Text, TextInput, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView } from 'react-native';
import { LogIn, UserRoundPlus, Mail, Lock } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useThemeColor } from 'heroui-native';
import { SafeView } from '../../shared/ui/SafeView';
import { useAuth } from '../../providers/AuthProvider';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { signInWithEmail, signUpWithEmail, signInWithApple } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // useThemeColor 只用于无法通过 className 传递的原生 color prop（图标、动态状态）
  const [accent, fieldPlaceholder] = useThemeColor(['accent', 'field-placeholder'] as const);

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Error', `Please enter ${t('auth_email_placeholder')} and ${t('auth_password_placeholder')}`);
      return;
    }
    setLoading(true);
    if (isSignUp) {
      const { error } = await signUpWithEmail(email, password);
      setLoading(false);
      if (error) Alert.alert('Sign Up Error', error.message);
      else Alert.alert(t('auth_signup_success_title'), t('auth_signup_success_msg'));
    } else {
      const { error } = await signInWithEmail(email, password);
      setLoading(false);
      if (error) Alert.alert('Login Error', error.message);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      await signInWithApple();
    } catch (err) {
      Alert.alert('Apple Sign-In Error', (err as Error).message);
    }
  };

  return (
    <SafeView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          testID="login-screen"
          contentContainerClassName="grow justify-center px-6 py-12"
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center w-full">
            {isSignUp
              ? <UserRoundPlus size={48} color={accent} strokeWidth={1.5} />
              : <LogIn size={48} color={accent} strokeWidth={1.5} />
            }

            <Text className="text-2xl font-bold text-foreground mt-4 mb-2">
              {isSignUp ? t('auth_signup') : t('auth_login')}
            </Text>
            <Text className="text-sm text-muted text-center mb-8">
              {isSignUp ? t('auth_signup_subtitle') : t('auth_login_subtitle')}
            </Text>

            {/* Email */}
            <View className="w-full flex-row items-center bg-field rounded-xl px-4 py-3 mb-3">
              <Mail size={18} color={fieldPlaceholder} strokeWidth={1.5} />
              <TextInput
                testID="login-email-input"
                className="flex-1 ml-3 text-base text-field-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                placeholder={t('auth_email_placeholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View className="w-full flex-row items-center bg-field rounded-xl px-4 py-3 mb-6">
              <Lock size={18} color={fieldPlaceholder} strokeWidth={1.5} />
              <TextInput
                testID="login-password-input"
                className="flex-1 ml-3 text-base text-field-foreground"
                placeholderTextColorClassName="accent-field-placeholder"
                placeholder={t('auth_password_placeholder')}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {/* Submit */}
            <Pressable
              testID="login-submit-button"
              className={`w-full rounded-xl py-4 items-center mb-4 ${loading ? 'opacity-60' : ''}`}
              style={{ backgroundColor: accent }}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text className="text-white font-semibold text-base">
                {loading
                  ? (isSignUp ? t('auth_signing_up') : t('auth_signing_in'))
                  : (isSignUp ? t('auth_signup') : t('auth_login'))}
              </Text>
            </Pressable>

            {/* Divider */}
            <View className="w-full flex-row items-center my-4">
              <View className="flex-1 h-px bg-border" />
              <Text className="mx-4 text-xs text-muted">{t('auth_or')}</Text>
              <View className="flex-1 h-px bg-border" />
            </View>

            {/* Apple Sign-In */}
            <Pressable
              testID="login-apple-button"
              className="w-full flex-row items-center justify-center gap-2 bg-black rounded-xl py-4"
              onPress={handleAppleSignIn}
            >
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="white">
                <Path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </Svg>
              <Text className="text-white font-medium">{t('auth_continue_with_apple')}</Text>
            </Pressable>

            {/* Toggle sign up / sign in */}
            <Pressable testID="login-toggle-mode" className="mt-6" onPress={() => setIsSignUp(!isSignUp)}>
              <Text className="text-sm font-medium" style={{ color: accent }}>
                {isSignUp ? t('auth_switch_to_login') : t('auth_switch_to_signup')}
              </Text>
            </Pressable>

            {/* Skip login (dev mode) */}
            {__DEV__ && (
              <Pressable testID="login-skip-dev" className="mt-4" onPress={() => router.replace('/(tabs)')}>
                <Text className="text-muted text-sm">{t('auth_skip_dev')}</Text>
              </Pressable>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeView>
  );
}
