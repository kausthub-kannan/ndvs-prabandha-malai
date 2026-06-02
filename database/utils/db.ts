import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AcharyaListItem {
  id: number;
  name: string;
}

export interface AcharyaDetail {
  id: number;
  name: string;
  bio: string;
  time_period: string;
  birthplace: string;
}

export interface AlwarListItem {
  id: number;
  name: string;
}

export interface AlwarDetail {
  id: number;
  name: string;
  incarnation: string;
  bio: string;
  time_period: string;
  birthplace: string;
}

export interface DivyaDeshamListItem {
  id: number;
  name: string;
}

export interface DivyaDeshamDetail {
  id: number;
  name: string;
  place: string;
  state: string;
  info: string;
}

export interface GlossaryItem {
  word: string;
  definition: string;
}

export interface PrabhandhamListItem {
  prabhandham: string;
  azhwar: string;
  pasuram_count: number;
}

export interface PasuramListItem {
  id: number;
  si_no: number;
  prabhandham: string;
  tamil_scripts: string;
  english_scripts: string;
  azhwar: string;
  bookmark: number;
}

export interface PasuramDetail extends PasuramListItem {
  meaning: string;
  purport: string;
  archavathara: string;
  avataram: string;
  rasa: string;
}

export interface AdjacentPasuramIds {
  prevId: number | null;
  nextId: number | null;
}

export interface FilterTags {
  azhwar: string[];
  archavathara: string[];
  avataram: string[];
  rasa: string[];
}

export type SearchType = 'lyrics' | 'meaning';

export interface SearchTags {
  azhwar?: string[];
  archavathara?: string[];
  avataram?: string[];
  rasa?: string[];
}

// ---------------------------------------------------------------------------
// Singleton DB connection
// ---------------------------------------------------------------------------

const DB_NAME = "ndvs.db"

/**
 * Required tables to verify the DB is healthy.
 * If any are missing the bundled asset is re-copied from app resources.
 */
const REQUIRED_TABLES = ['prabhandham', 'prabhandham_fts', 'acharyas', 'alwars', 'divya_deshams', 'glossary'];

let _dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Ensures the bundled SQLite asset is copied to the documents directory
 * (if needed) and returns a single shared database connection.
 *
 * Calling this function multiple times is safe — it will always resolve
 * to the same underlying connection.
 */
export function ensureDb(): Promise<SQLite.SQLiteDatabase> {
  if (_dbPromise) return _dbPromise;

  _dbPromise = (async () => {
    const sqliteDir = new Directory(Paths.document, 'SQLite');
    if (!sqliteDir.exists) {
      sqliteDir.create();
    }

    const dbFile = new File(sqliteDir, DB_NAME);
    let shouldCopy = !dbFile.exists;

    if (dbFile.exists && !shouldCopy) {
      // Validate that all required tables exist (guard against corrupt / empty DB)
      try {
        const probe = await SQLite.openDatabaseAsync(DB_NAME);
        for (const table of REQUIRED_TABLES) {
          const row = await probe.getFirstAsync(
            `SELECT name FROM sqlite_master WHERE type='table' AND name=?;`,
            [table]
          );
          if (!row) {
            shouldCopy = true;
            break;
          }
        }
        await probe.closeAsync();
      } catch {
        shouldCopy = true;
      }
    }

    if (shouldCopy) {
      if (dbFile.exists) {
        try {
          dbFile.delete();
        } catch (err) {
          console.error('[db] Failed to delete corrupt database file:', err);
        }
      }

      // Copy the bundled asset to the SQLite directory
      const dbAsset = require('../../assets/db/ndvs.db');
      const asset = Asset.fromModule(dbAsset);
      await asset.downloadAsync();

      if (!asset.localUri) {
        throw new Error('[db] Failed to resolve local URI for database asset');
      }

      const assetFile = new File(asset.localUri);
      await assetFile.copy(dbFile);
    }

    return SQLite.openDatabaseAsync(DB_NAME);
  })();

  return _dbPromise;
}
