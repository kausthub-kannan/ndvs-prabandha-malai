import { openDb } from './prabhandham';

export async function getFilterTags() {
    const db = await openDb();
    const rows = await db.getAllAsync(
        `SELECT DISTINCT azhwar, archavathara, avataram, rasa FROM prabhandham;`
    );

    const azhwar = new Set();
    const archavathara = new Set();
    const avataram = new Set();
    const rasa = new Set();

    rows.forEach(row => {
        if (row.azhwar && row.azhwar.trim()) azhwar.add(row.azhwar.trim());
        if (row.archavathara) {
            row.archavathara.split(',').forEach(part => {
                if (part.trim()) archavathara.add(part.trim());
            });
        }
        if (row.avataram) {
            row.avataram.split(',').forEach(part => {
                if (part.trim()) avataram.add(part.trim());
            });
        }
        if (row.rasa) {
            row.rasa.split(',').forEach(part => {
                if (part.trim()) rasa.add(part.trim());
            });
        }
    });

    return {
        azhwar: Array.from(azhwar).sort(),
        archavathara: Array.from(archavathara).sort(),
        avataram: Array.from(avataram).sort(),
        rasa: Array.from(rasa).sort(),
    };
}

/**
 * Searches pasurams based on text query and tags.
 * @param {string} query Search text
 * @param {'lyrics'|'meaning'} searchType What to search in
 * @param {Object} tags Selected tags (azhwar, archavathara, avataram, rasa as arrays)
 */
export async function searchPasurams(query, searchType, tags = {}) {
    const db = await openDb();
    let sql = '';
    const params = [];
    
    // Build tag filter conditions
    const filterConditions = [];
    
    if (tags.azhwar && tags.azhwar.length > 0) {
        const placeholders = tags.azhwar.map(() => '?').join(',');
        filterConditions.push(`TRIM(p.azhwar) IN (${placeholders})`);
        params.push(...tags.azhwar);
    }
    if (tags.archavathara && tags.archavathara.length > 0) {
        const likeConditions = tags.archavathara.map(() => `p.archavathara LIKE ?`).join(' OR ');
        filterConditions.push(`(${likeConditions})`);
        tags.archavathara.forEach(tag => params.push(`%${tag}%`));
    }
    if (tags.avataram && tags.avataram.length > 0) {
        const likeConditions = tags.avataram.map(() => `p.avataram LIKE ?`).join(' OR ');
        filterConditions.push(`(${likeConditions})`);
        tags.avataram.forEach(tag => params.push(`%${tag}%`));
    }
    if (tags.rasa && tags.rasa.length > 0) {
        const likeConditions = tags.rasa.map(() => `p.rasa LIKE ?`).join(' OR ');
        filterConditions.push(`(${likeConditions})`);
        tags.rasa.forEach(tag => params.push(`%${tag}%`));
    }

    const filterSql = filterConditions.length > 0 ? ` AND ${filterConditions.join(' AND ')}` : '';

    if (!query || query.trim() === '') {
        // No text query, just filter by tags if any
        if (filterConditions.length === 0) return []; // Don't return all pasurams by default
        
        sql = `
            SELECT p.id, p.si_no, p.prabhandham, p.tamil_scripts, p.english_scripts, p.azhwar, p.bookmark
            FROM prabhandham p
            WHERE 1=1 ${filterSql.replace(' AND ', ' AND ')}
            ORDER BY p.prabhandham ASC, p.si_no ASC
            LIMIT 200;
        `;
    } else {
        // Text search via FTS
        const sanitizedQuery = query.trim().replace(/['"]/g, '');
        // Prefix/fuzzy matching style for FTS: e.g. "keyword*"
        const ftsQuery = `"${sanitizedQuery}" *`;
        
        // FTS match syntax based on search type
        let ftsExpr = '';
        if (searchType === 'lyrics') {
            ftsExpr = `{tamil_scripts english_scripts} : ${ftsQuery}`;
        } else {
            ftsExpr = `meaning : ${ftsQuery}`;
        }
        
        // Add the FTS query parameter at the START of the params array
        params.unshift(ftsExpr);

        sql = `
            SELECT p.id, p.si_no, p.prabhandham, p.tamil_scripts, p.english_scripts, p.azhwar, p.bookmark, f.rank
            FROM prabhandham_fts f
            JOIN prabhandham p ON f.rowid = p.id
            WHERE prabhandham_fts MATCH ? ${filterSql}
            ORDER BY f.rank
            LIMIT 200;
        `;
    }

    try {
        const rows = await db.getAllAsync(sql, params);
        return rows;
    } catch (e) {
        console.error('Search failed:', e);
        return [];
    }
}
