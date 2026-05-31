import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { File, Directory, Paths } from 'expo-file-system';

export async function openDb() {
    const dbName = 'ndvs.db';

    // Ensure directory exists
    const sqliteDir = new Directory(Paths.document, 'SQLite');
    if (!sqliteDir.exists) {
        sqliteDir.create();
    }

    const dbFile = new File(sqliteDir, dbName);
    let shouldCopy = !dbFile.exists;

    // If file exists, check if 'prabhandham' and 'prabhandham_fts' tables exist to heal empty/corrupt DBs or update to new DB versions
    if (dbFile.exists) {
        try {
            const db = await SQLite.openDatabaseAsync(dbName);
            const prabhandhamTableExists = await db.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='prabhandham';"
            );
            const ftsTableExists = await db.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='prabhandham_fts';"
            );
            await db.closeAsync();
            if (!prabhandhamTableExists || !ftsTableExists) {
                shouldCopy = true;
            }
        } catch (e) {
            shouldCopy = true;
        }
    }

    if (shouldCopy) {
        if (dbFile.exists) {
            try {
                dbFile.delete();
            } catch (deleteError) {
                console.error('Error deleting corrupt/empty database file:', deleteError);
            }
        }
        const dbAsset = require('../assets/db/ndvs.db');
        const asset = Asset.fromModule(dbAsset);
        await asset.downloadAsync();
        
        if (asset.localUri) {
            const assetFile = new File(asset.localUri);
            await assetFile.copy(dbFile);
        } else {
            throw new Error('Failed to get local URI for database asset');
        }
    }

    return SQLite.openDatabaseAsync(dbName);
}

/**
 * Fetches all prabandhams with their associated Alwar name and pasuram count.
 * Tiruppavai rows with a blank azhwar are excluded via TRIM + filtering.
 * Returns: [{ prabhandham, azhwar, pasuram_count }]
 */
export async function getPrabhandhamList() {
    const db = await openDb();
    try {
        const tables = await db.getAllAsync("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Available tables:', tables);
    } catch (error) {
        console.error('Error querying available tables:', error);
    }
    const rows = await db.getAllAsync(`
    SELECT
      prabhandham,
      TRIM(azhwar) AS azhwar,
      COUNT(*) AS pasuram_count
    FROM prabhandham
    WHERE TRIM(azhwar) != ''
    GROUP BY prabhandham, TRIM(azhwar)
    ORDER BY prabhandham ASC;
  `);
    return rows;
}

/**
 * Fetches all pasurams for a given prabhandham name.
 * Returns: [{ id, si_no, prabhandham, tamil_scripts, azhwar, bookmark }]
 */
export async function getPasuramsByPrabhandham(prabhandhamName) {
    const db = await openDb();
    const rows = await db.getAllAsync(
        `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, azhwar, bookmark
         FROM prabhandham
         WHERE prabhandham = ?
         ORDER BY si_no ASC;`,
        [prabhandhamName]
    );
    return rows;
}

/**
 * Fetches a single pasuram by its primary key.
 * Returns: { id, si_no, prabhandham, tamil_scripts, english_scripts, meaning, purport, azhwar, bookmark }
 */
export async function getPasuramById(id) {
    const db = await openDb();
    const row = await db.getFirstAsync(
        `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, meaning, purport, azhwar, bookmark, archavathara, avataram, rasa
         FROM prabhandham
         WHERE id = ?;`,
        [id]
    );
    return row;
}

/**
 * Returns the previous and next pasuram IDs within the same prabhandham, ordered by si_no.
 * Returns: { prevId: number|null, nextId: number|null }
 */
export async function getAdjacentPasuramIds(id) {
    const db = await openDb();

    const current = await db.getFirstAsync(
        `SELECT prabhandham, si_no FROM prabhandham WHERE id = ?;`,
        [id]
    );
    if (!current) return { prevId: null, nextId: null };

    const prev = await db.getFirstAsync(
        `SELECT id FROM prabhandham
         WHERE prabhandham = ? AND si_no < ?
         ORDER BY si_no DESC
         LIMIT 1;`,
        [current.prabhandham, current.si_no]
    );

    const next = await db.getFirstAsync(
        `SELECT id FROM prabhandham
         WHERE prabhandham = ? AND si_no > ?
         ORDER BY si_no ASC
         LIMIT 1;`,
        [current.prabhandham, current.si_no]
    );

    return {
        prevId: prev ? prev.id : null,
        nextId: next ? next.id : null,
    };
}

/**
 * Toggles the bookmark status of a pasuram.
 * @param {number} id - The pasuram primary key
 * @param {number} currentValue - Current bookmark value (0 or 1)
 * @returns {number} New bookmark value
 */
export async function toggleBookmark(id, currentValue) {
    const db = await openDb();
    const newValue = currentValue === 1 ? 0 : 1;
    await db.runAsync(
        `UPDATE prabhandham SET bookmark = ? WHERE id = ?;`,
        [newValue, id]
    );
    return newValue;
}

/**
 * Fetches all bookmarked pasurams.
 * Returns: [{ id, si_no, prabhandham, tamil_scripts, azhwar, bookmark }]
 */
export async function getBookmarkedPasurams() {
    const db = await openDb();
    const rows = await db.getAllAsync(
        `SELECT id, si_no, prabhandham, tamil_scripts, english_scripts, azhwar, bookmark
         FROM prabhandham
         WHERE bookmark = 1
         ORDER BY prabhandham ASC, si_no ASC;`
    );
    return rows;
}
