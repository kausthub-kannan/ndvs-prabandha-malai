import * as SQLite from 'expo-sqlite';

export async function getGlossaryList(searchTerm = '') {
  const db = await SQLite.openDatabaseAsync('ndvs.db');
  
  if (searchTerm && searchTerm.trim() !== '') {
    const query = `
      SELECT word, definition FROM glossary 
      WHERE word LIKE ? COLLATE NOCASE 
      ORDER BY word ASC
    `;
    return await db.getAllAsync(query, [`%${searchTerm}%`]);
  } else {
    const query = `SELECT word, definition FROM glossary ORDER BY word ASC`;
    return await db.getAllAsync(query);
  }
}
