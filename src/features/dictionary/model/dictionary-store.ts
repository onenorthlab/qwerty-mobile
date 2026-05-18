import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { zustandStorage } from '../../../shared/lib/storage';
import { DICTIONARIES } from './dictionary-metadata';

interface DictionarySelectionState {
  currentDictId: string;
  currentChapter: number;
  selectDictionary: (id: string) => void;
  setChapter: (chapter: number) => void;
}

const DEFAULT_DICT_ID = DICTIONARIES[0]?.id ?? 'CET4_T';

export const useDictionarySelection = create<DictionarySelectionState>()(
  persist(
    (set) => ({
      currentDictId: DEFAULT_DICT_ID,
      currentChapter: 0,
      selectDictionary: (id) => set({ currentDictId: id, currentChapter: 0 }),
      setChapter: (chapter) => set({ currentChapter: chapter }),
    }),
    {
      name: 'dictionary-selection-v1',
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
