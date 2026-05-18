import { useCallback, useEffect, useState } from 'react';
import { insertWordRecord, listErrorWords, type WordRecordRow } from './db';

export interface RecordCompletedSessionInput {
  dictId: string;
  chapter: number;
  results: {
    word: string;
    wrongCount: number;
    mistakes: string[];
    timingMs: number | null;
  }[];
}

export function useWordRecordsActions(): {
  recordSession: (input: RecordCompletedSessionInput) => Promise<void>;
} {
  const recordSession = useCallback(async (input: RecordCompletedSessionInput) => {
    for (const r of input.results) {
      await insertWordRecord({
        word: r.word,
        dictId: input.dictId,
        chapter: input.chapter,
        wrongCount: r.wrongCount,
        mistakes: r.mistakes,
        timingMs: r.timingMs,
      });
    }
  }, []);

  return { recordSession };
}

export function useErrorWords(limit = 50): {
  rows: WordRecordRow[];
  isLoading: boolean;
  reload: () => Promise<void>;
} {
  const [rows, setRows] = useState<WordRecordRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const r = await listErrorWords(limit);
      setRows(r);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { rows, isLoading, reload };
}
