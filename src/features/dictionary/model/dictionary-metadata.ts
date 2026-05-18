export interface DictionaryMetadata {
  id: string;
  name: string;
  language: 'en';
  category: string;
  length: number;
  defaultAccent: 'us' | 'uk';
}

export const DICTIONARIES: DictionaryMetadata[] = [
  {
    id: 'CET4_T',
    name: 'CET-4 核心词',
    language: 'en',
    category: '考试',
    length: 2607,
    defaultAccent: 'us',
  },
];

export function findDictionary(id: string): DictionaryMetadata | null {
  return DICTIONARIES.find((d) => d.id === id) ?? null;
}
