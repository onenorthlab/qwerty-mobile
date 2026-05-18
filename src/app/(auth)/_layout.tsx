import { Redirect, Stack } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { AuthTransitionScreen } from '../../shared/ui/AuthTransitionScreen';
import { FEATURES } from '../../shared/config/features';

export default function AuthLayout() {
  const { session, isLoading, isAuthProcessing } = useAuth();

  // AUTH feature disabled → block all auth routes
  if (!FEATURES.AUTH) return <Redirect href="/(tabs)" />;

  if (isLoading || isAuthProcessing) {
    return <AuthTransitionScreen />;
  }

  // When auth state is ready and user is signed in, keep auth routes inaccessible.
  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    />
  );
}
