import type { Word } from '../../typing';

type Loader = () => readonly Word[];

const LOADERS: Record<string, Loader> = {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  CET4_T: () => require('../../../../assets/dicts/CET4_T.json') as Word[],
};

export function loadDictionary(id: string): Word[] {
  const loader = LOADERS[id];
  if (!loader) {
    throw new Error(`Unknown dictionary id: ${id}`);
  }
  return [...loader()];
}

export function getChapterWords(id: string, chapter: number, size = 10): Word[] {
  const all = loadDictionary(id);
  const start = chapter * size;
  return all.slice(start, start + size);
}

export function getChapterCount(id: string, size = 10): number {
  const all = loadDictionary(id);
  return Math.ceil(all.length / size);
}
