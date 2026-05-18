import { useCallback, useEffect, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  Alert,
  Button,
  Input,
  Label,
  Spinner,
  TextArea,
  TextField,
  useThemeColor,
} from 'heroui-native';
import { Camera, X } from 'lucide-react-native';

import {
  DEFAULT_MAX_SCREENSHOT_BYTES,
  isWithinSizeLimit,
  resolveI18n,
  submitFeedback,
  useDeviceInfo,
  useDraft,
  type DraftStorageProp,
  type PickedScreenshot,
  type WidgetState,
} from '../lib/widget';
import { widgetExtraTranslations } from '../lib/translations';

export interface FeedbackSheetProps {
  visible: boolean;
  onClose: () => void;
  appId: string;
  appVersion: string;
  relayEndpoint: string;
  apiKey: string;
  userId?: string | null;
  email?: string | null;
  emailEditable?: boolean;
  deviceId?: string | null;
  locale?: string;
  storage?: DraftStorageProp;
  pickScreenshot?: () => Promise<PickedScreenshot | null>;
  /**
   * Screenshot pushed in by the host (e.g. captured by the auto-screenshot
   * listener). When a new value arrives the sheet attaches it and switches
   * to EDITING — meant to pair with the parent flipping `visible` to true.
   */
  injectedScreenshot?: PickedScreenshot | null;
  maxScreenshotBytes?: number;
}

export function FeedbackSheet(props: FeedbackSheetProps) {
  const {
    visible,
    onClose,
    appId,
    appVersion,
    relayEndpoint,
    apiKey,
    userId,
    email: emailProp,
    emailEditable = true,
    deviceId,
    locale,
    storage,
    pickScreenshot,
    injectedScreenshot,
    maxScreenshotBytes = DEFAULT_MAX_SCREENSHOT_BYTES,
  } = props;

  const [state, setState] = useState<WidgetState>({ kind: 'EDITING' });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [pickerError, setPickerError] = useState('');
  const device = useDeviceInfo();
  const lastVisibleRef = useRef(visible);
  const lastInjectedBase64Ref = useRef<string | null>(null);

  const { t } = resolveI18n({
    locale,
    extraTranslations: widgetExtraTranslations,
  });

  const draft = useDraft({ storage, appId });
  const description = draft.value.description;
  const email = draft.value.email || (emailProp ?? '');

  const [muted, danger] = useThemeColor(['muted', 'danger'] as const);

  // Reset transient state every time the sheet opens.
  useEffect(() => {
    if (visible && !lastVisibleRef.current) {
      setState({ kind: 'EDITING' });
      setPickerError('');
    }
    lastVisibleRef.current = visible;
  }, [visible]);

  // Apply screenshots injected by the host (e.g. auto-capture). Switch to
  // EDITING unless we're mid-upload, mirroring the original widget's
  // behaviour. Dedupe by base64 so a re-render with the same screenshot
  // doesn't reset the form.
  useEffect(() => {
    const incoming = injectedScreenshot;
    if (!incoming?.base64) return;
    if (incoming.base64 === lastInjectedBase64Ref.current) return;
    lastInjectedBase64Ref.current = incoming.base64;

    if (!isWithinSizeLimit(incoming.base64, maxScreenshotBytes)) {
      setPickerError(
        t('screenshot_too_large', { maxKb: Math.round(maxScreenshotBytes / 1024) }),
      );
      setState((prev) =>
        prev.kind === 'UPLOADING' || prev.kind === 'EDITING' ? prev : { kind: 'EDITING' },
      );
      return;
    }

    setPickerError('');
    setScreenshot(incoming.base64);
    setState((prev) =>
      prev.kind === 'UPLOADING' || prev.kind === 'EDITING' ? prev : { kind: 'EDITING' },
    );
  }, [injectedScreenshot, maxScreenshotBytes, t]);

  const handleClose = useCallback(() => {
    setScreenshot(null);
    setPickerError('');
    onClose();
  }, [onClose]);

  const handlePickScreenshot = useCallback(async () => {
    if (!pickScreenshot) return;
    setPickerError('');
    try {
      const picked = await pickScreenshot();
      if (!picked) return;
      if (!isWithinSizeLimit(picked.base64, maxScreenshotBytes)) {
        setPickerError(
          t('screenshot_too_large', { maxKb: Math.round(maxScreenshotBytes / 1024) }),
        );
        return;
      }
      setScreenshot(picked.base64);
    } catch (err) {
      setPickerError(err instanceof Error ? err.message : 'Failed to pick screenshot.');
    }
  }, [pickScreenshot, maxScreenshotBytes, t]);

  const handleClearScreenshot = useCallback(() => {
    setScreenshot(null);
    setPickerError('');
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) return;
    setState({ kind: 'UPLOADING' });
    const result = await submitFeedback({
      relayEndpoint,
      apiKey,
      payload: {
        app_id: appId,
        description,
        app_version: appVersion,
        platform: device.platform,
        os_version: device.osVersion,
        device_model: device.deviceModel,
        user_id: userId ?? null,
        user_email: email || null,
        device_id: deviceId ?? null,
        screenshot,
      },
    });
    if (result.ok) {
      draft.clear();
      setScreenshot(null);
      setState({
        kind: 'SUCCESS',
        issueNumber: result.issue_number,
        issueUrl: result.issue_url,
      });
    } else {
      setState({
        kind: 'ERROR',
        message: result.message ?? t('error_default'),
        retryable: result.reason === 'network' || result.reason === 'server',
      });
    }
  }, [
    description,
    email,
    screenshot,
    relayEndpoint,
    apiKey,
    appId,
    appVersion,
    device,
    userId,
    deviceId,
    draft,
    t,
  ]);

  const showEmailInput = emailEditable;
  const submitDisabled = state.kind === 'UPLOADING' || !description.trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={handleClose}
      transparent
      testID="feedback-sheet"
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="flex-1" onPress={handleClose} accessibilityLabel={t('close')} />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="bg-background rounded-t-2xl"
          style={{ maxHeight: '90%' }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="p-5 pb-8 gap-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-foreground">{t('title')}</Text>
              <Pressable
                onPress={handleClose}
                hitSlop={12}
                accessibilityLabel={t('close')}
                testID="feedback-sheet-close"
              >
                <X size={20} color={muted} />
              </Pressable>
            </View>

            {(state.kind === 'EDITING' || state.kind === 'UPLOADING') && (
              <>
                <TextField isDisabled={state.kind === 'UPLOADING'}>
                  <Label>{t('description_label')}</Label>
                  <TextArea
                    testID="feedback-description-input"
                    value={description}
                    onChangeText={draft.setDescription}
                    placeholder={t('description_placeholder')}
                    numberOfLines={5}
                  />
                </TextField>

                {showEmailInput && (
                  <TextField isDisabled={state.kind === 'UPLOADING'}>
                    <Label>{t('email_label')}</Label>
                    <Input
                      testID="feedback-email-input"
                      value={email}
                      onChangeText={draft.setEmail}
                      placeholder={t('email_placeholder')}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </TextField>
                )}

                {pickScreenshot && (
                  <View className="flex-row items-center gap-3">
                    {screenshot ? (
                      <View className="flex-row items-center gap-2 flex-1">
                        <Text className="text-sm text-success flex-1">
                          {t('screenshot_attached')}
                        </Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onPress={handleClearScreenshot}
                          testID="feedback-screenshot-remove"
                          isDisabled={state.kind === 'UPLOADING'}
                        >
                          <Button.Label className="text-danger">
                            {t('screenshot_remove')}
                          </Button.Label>
                        </Button>
                      </View>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={handlePickScreenshot}
                        isDisabled={state.kind === 'UPLOADING'}
                        testID="feedback-screenshot-pick"
                      >
                        <View className="flex-row items-center gap-2">
                          <Camera size={16} color={muted} />
                          <Button.Label>{t('screenshot_pick')}</Button.Label>
                        </View>
                      </Button>
                    )}
                  </View>
                )}

                {pickerError ? (
                  <Alert status="warning">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Description>{pickerError}</Alert.Description>
                    </Alert.Content>
                  </Alert>
                ) : null}

                <Text className="text-xs text-muted-foreground">
                  {t('device_preview', {
                    platform: device.platform,
                    osVersion: device.osVersion,
                    deviceModel: device.deviceModel,
                  })}
                </Text>

                <Button
                  onPress={handleSubmit}
                  isDisabled={submitDisabled}
                  testID="feedback-submit"
                >
                  {state.kind === 'UPLOADING' ? (
                    <View className="flex-row items-center gap-2">
                      <Spinner size="sm" color="default" />
                      <Button.Label>{t('submitting')}</Button.Label>
                    </View>
                  ) : (
                    <Button.Label>{t('submit')}</Button.Label>
                  )}
                </Button>
              </>
            )}

            {state.kind === 'SUCCESS' && (
              <>
                <Alert status="success">
                  <Alert.Indicator />
                  <Alert.Content>
                    <Alert.Title>{t('success_title')}</Alert.Title>
                    <Alert.Description>
                      {t('success_meta', { issueNumber: state.issueNumber })}
                    </Alert.Description>
                  </Alert.Content>
                </Alert>
                <Button onPress={handleClose} testID="feedback-close-success">
                  <Button.Label>{t('close')}</Button.Label>
                </Button>
              </>
            )}

            {state.kind === 'ERROR' && (
              <>
                <Alert status="danger">
                  <Alert.Indicator iconProps={{ color: danger }} />
                  <Alert.Content>
                    <Alert.Description>{state.message}</Alert.Description>
                  </Alert.Content>
                </Alert>
                {state.retryable && (
                  <Button onPress={handleSubmit} testID="feedback-retry">
                    <Button.Label>{t('retry')}</Button.Label>
                  </Button>
                )}
                <Button variant="ghost" onPress={handleClose} testID="feedback-close-error">
                  <Button.Label>{t('close')}</Button.Label>
                </Button>
              </>
            )}

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
