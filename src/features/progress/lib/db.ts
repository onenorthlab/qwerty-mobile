import * as SQLite from 'expo-sqlite';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = 'qwerty-progress.db';

const SCHEMA_V1 = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS word_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    uuid TEXT NOT NULL UNIQUE,
    word TEXT NOT NULL,
    dict_id TEXT NOT NULL,
    chapter INTEGER NOT NULL,
    wrong_count INTEGER NOT NULL DEFAULT 0,
    mistakes_json TEXT NOT NULL DEFAULT '[]',
    timing_ms INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL,
    deleted_at INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_word_records_dict_chapter
    ON word_records(dict_id, chapter);
  CREATE INDEX IF NOT EXISTS idx_word_records_updated_at
    ON word_records(updated_at);
  CREATE INDEX IF NOT EXISTS idx_word_records_wrong_count
    ON word_records(wrong_count) WHERE wrong_count > 0;
`;

export async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(SCHEMA_V1);
      return db;
    })();
  }
  return dbPromise;
}

export async function resetDb(): Promise<void> {
  const db = await getDb();
  await db.execAsync('DELETE FROM word_records');
}

export interface WordRecordRow {
  id: number;
  uuid: string;
  word: string;
  dict_id: string;
  chapter: number;
  wrong_count: number;
  mistakes_json: string;
  timing_ms: number | null;
  created_at: number;
  updated_at: number;
  deleted_at: number | null;
}

function makeUuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export interface InsertWordRecordInput {
  word: string;
  dictId: string;
  chapter: number;
  wrongCount: number;
  mistakes: string[];
  timingMs: number | null;
}

export async function insertWordRecord(input: InsertWordRecordInput): Promise<void> {
  const db = await getDb();
  const now = Date.now();
  await db.runAsync(
    `INSERT INTO word_records
      (uuid, word, dict_id, chapter, wrong_count, mistakes_json, timing_ms, created_at, updated_at, deleted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL)`,
    [
      makeUuid(),
      input.word,
      input.dictId,
      input.chapter,
      input.wrongCount,
      JSON.stringify(input.mistakes),
      input.timingMs,
      now,
      now,
    ],
  );
}

export async function listErrorWords(limit = 50): Promise<WordRecordRow[]> {
  const db = await getDb();
  return db.getAllAsync<WordRecordRow>(
    `SELECT * FROM word_records
      WHERE wrong_count > 0 AND deleted_at IS NULL
      ORDER BY updated_at DESC
      LIMIT ?`,
    [limit],
  );
}

export async function countWordRecords(): Promise<number> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ c: number }>(
    `SELECT COUNT(*) as c FROM word_records WHERE deleted_at IS NULL`,
  );
  return rows[0]?.c ?? 0;
}
