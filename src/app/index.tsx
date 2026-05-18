import { Redirect } from 'expo-router';
import { useAuth } from '../providers/AuthProvider';
import { AuthTransitionScreen } from '../shared/ui/AuthTransitionScreen';
import { FEATURES } from '../shared/config/features';

export default function RootIndex() {
  const { session, isLoading, isAuthProcessing } = useAuth();

  // AUTH feature disabled → skip login entirely
  if (!FEATURES.AUTH) return <Redirect href="/(tabs)" />;

  if (isLoading || isAuthProcessing) {
    return <AuthTransitionScreen />;
  }

  // Authenticated → main app
  if (session) return <Redirect href="/(tabs)" />;

  // Not authenticated → redirect to login
  return <Redirect href="/(auth)/login" />;
}
