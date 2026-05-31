import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import { File, Directory, Paths } from 'expo-file-system';

async function openDb() {
    const dbName = 'ndvs.db';

    const sqliteDir = new Directory(Paths.document, 'SQLite');
    if (!sqliteDir.exists) {
        sqliteDir.create();
    }

    const dbFile = new File(sqliteDir, dbName);
    let shouldCopy = !dbFile.exists;

    if (dbFile.exists) {
        try {
            const db = await SQLite.openDatabaseAsync(dbName);
            const tableExists = await db.getFirstAsync(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='divya_deshams';"
            );
            await db.closeAsync();
            if (!tableExists) {
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

export async function getDivyaDeshamsList() {
    const db = await openDb();
    const rows = await db.getAllAsync(
        `SELECT id, name FROM divya_deshams ORDER BY id ASC;`
    );
    return rows;
}

export async function getDivyaDeshamById(id) {
    const db = await openDb();
    const row = await db.getFirstAsync(
        `SELECT id, name, place, state, info FROM divya_deshams WHERE id = ?;`,
        [id]
    );
    return row;
}
