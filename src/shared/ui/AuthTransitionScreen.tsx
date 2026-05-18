import { ActivityIndicator, Text, View } from 'react-native';
import { useThemeColor } from 'heroui-native';

export function AuthTransitionScreen() {
  const background = useThemeColor('background');
  return (
    // 根容器保持 style prop（避免 className 级联影响 Text 颜色）
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: background }}>
      {/* ActivityIndicator 的原生 color prop 用 colorClassName 替代 */}
      <ActivityIndicator size="small" colorClassName="accent-accent" />
      <Text className="mt-3 text-sm text-muted">Signing you in...</Text>
    </View>
  );
}
