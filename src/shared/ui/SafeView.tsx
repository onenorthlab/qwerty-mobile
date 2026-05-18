import { SafeAreaView, type SafeAreaViewProps, type Edge } from 'react-native-safe-area-context';
import { useThemeColor } from 'heroui-native';

interface SafeViewProps extends SafeAreaViewProps {
  children: React.ReactNode;
  /** 默认包含全部四边。Tab 页面内传 ['top','left','right'] 避免与 Tab Bar 重复补底部 inset。 */
  edges?: readonly Edge[];
}

export function SafeView({ children, style, edges, ...props }: SafeViewProps) {
  const backgroundColor = useThemeColor('background');

  return (
    <SafeAreaView
      style={[{ flex: 1, backgroundColor }, style]}
      edges={edges}
      {...props}
    >
      {children}
    </SafeAreaView>
  );
}
