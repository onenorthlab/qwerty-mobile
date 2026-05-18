import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { HeroUINativeProvider } from 'heroui-native';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';
import { AuthProvider } from './AuthProvider';
import { NotificationProvider } from './NotificationProvider';
import { PurchaseProvider } from './PurchaseProvider';
import { FeedbackProvider } from '../features/feedback';

export function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>
        <PurchaseProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
              <HeroUINativeProvider>
                <BottomSheetModalProvider>
                  <FeedbackProvider>
                    {children}
                  </FeedbackProvider>
                </BottomSheetModalProvider>
              </HeroUINativeProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </ThemeProvider>
        </PurchaseProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
