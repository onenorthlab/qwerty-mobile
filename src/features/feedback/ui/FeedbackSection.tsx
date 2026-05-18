import { View, Text } from 'react-native';
import { ListGroup, useThemeColor } from 'heroui-native';
import { MessageSquare } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useAppColors } from '../../../shared/lib/useAppColors';
import { useFeedback } from './FeedbackProvider';

/**
 * Settings entry for the FeedbackBridge widget. Triggers the globally-
 * mounted sheet via FeedbackProvider context, so the sheet still works
 * when opened from auto-capture on any other route. Renders nothing if
 * the provider reports the feature is disabled or misconfigured.
 */
export function FeedbackSection() {
  const { t } = useTranslation();
  const { openSheet, isAvailable } = useFeedback();
  const [muted] = useThemeColor(['muted'] as const);
  const [purple] = useAppColors(['purple'] as const);

  if (!isAvailable) return null;

  return (
    <>
      <View className="flex-row items-center gap-2 mb-3">
        <MessageSquare size={18} color={purple} />
        <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          {t('settings_feedback')}
        </Text>
      </View>
      <View className="mb-6">
        <ListGroup>
          <ListGroup.Item testID="settings-feedback-row" onPress={openSheet}>
            <ListGroup.ItemPrefix>
              <MessageSquare size={18} color={muted} />
            </ListGroup.ItemPrefix>
            <ListGroup.ItemContent>
              <ListGroup.ItemTitle>{t('settings_feedback_send')}</ListGroup.ItemTitle>
              <ListGroup.ItemDescription>
                {t('settings_feedback_desc')}
              </ListGroup.ItemDescription>
            </ListGroup.ItemContent>
            <ListGroup.ItemSuffix />
          </ListGroup.Item>
        </ListGroup>
      </View>
    </>
  );
}
