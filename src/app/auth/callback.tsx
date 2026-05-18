import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../providers/AuthProvider';
import { AuthTransitionScreen } from '../../shared/ui/AuthTransitionScreen';

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [handled, setHandled] = useState(false);
  const { session, isLoading, isAuthProcessing } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthProcessing) {
      return;
    }
    if (!handled) {
      setHandled(true);
      router.replace(session ? '/(tabs)' : '/(auth)/login');
    }
  }, [handled, isAuthProcessing, isLoading, router, session]);

  if (handled) return null;

  return <AuthTransitionScreen />;
}
