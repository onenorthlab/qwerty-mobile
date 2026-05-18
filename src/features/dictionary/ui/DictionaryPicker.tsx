import { View, Text, Pressable } from 'react-native';
import { BookOpen, ChevronRight } from 'lucide-react-native';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { DICTIONARIES } from '../model/dictionary-metadata';
import { useDictionarySelection } from '../model/dictionary-store';

interface DictionaryPickerProps {
  onSelected: (id: string) => void;
}

export function DictionaryPicker({ onSelected }: DictionaryPickerProps) {
  const { t } = useTranslation();
  const [accent, muted, border, surface] = useThemeColor([
    'accent',
    'muted',
    'border',
    'surface',
  ] as const);
  const { currentDictId, selectDictionary } = useDictionarySelection();

  return (
    <View testID="dictionary-picker" className="gap-3">
      <Text className="text-base font-semibold" style={{ color: muted }}>
        {t('dict_picker_label')}
      </Text>
      {DICTIONARIES.map((d) => {
        const isActive = d.id === currentDictId;
        return (
          <Pressable
            key={d.id}
            testID={`dict-item-${d.id}`}
            onPress={() => {
              selectDictionary(d.id);
              onSelected(d.id);
            }}
            style={{
              backgroundColor: surface,
              borderColor: isActive ? accent : border,
              borderWidth: isActive ? 1.5 : 1,
              borderRadius: 16,
            }}
            className="flex-row items-center p-4"
          >
            <View
              style={{ backgroundColor: accent + '22' }}
              className="w-10 h-10 items-center justify-center rounded-xl"
            >
              <BookOpen size={20} color={accent} strokeWidth={1.5} />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-semibold" style={{ color: muted }}>
                {d.name}
              </Text>
              <Text className="text-xs mt-0.5" style={{ color: muted, opacity: 0.7 }}>
                {d.category} · {d.length} {t('dict_word_count_suffix')}
              </Text>
            </View>
            <ChevronRight size={18} color={muted} strokeWidth={1.5} />
          </Pressable>
        );
      })}
    </View>
  );
}
