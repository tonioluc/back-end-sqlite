const {
    getDatabase,
    persistDatabase
} = require("../../database/database");

/**
 * Convertit une ligne SQLite en objet de configuration Kanban.
 * @param {Array<any>} row Ligne issue de SQL.js.
 * @returns {{ statusKey: string, title: string, titleMg: string, color: string, updatedAt: string }} Colonne normalisee.
 */
const normalizeRow = (row) => ({
    statusKey: row[0],
    title: row[1],
    titleMg: row[2],
    color: row[3],
    updatedAt: row[4]
});

/**
 * Liste les colonnes Kanban dans l'ordre d'affichage.
 * @returns {Array<{ statusKey: string, title: string, titleMg: string, color: string, updatedAt: string }>} Colonnes Kanban.
 */
const listKanbanColors = () => {
    const db = getDatabase();
    const result = db.exec(`
        SELECT status_key, title, title_mg, color, updated_at
        FROM kanban_colors
        ORDER BY
            CASE status_key
                WHEN 'new' THEN 1
                WHEN 'inProgress' THEN 2
                WHEN 'done' THEN 3
                ELSE 4
            END;
    `);

    return result[0]?.values.map(normalizeRow) || [];
};

/**
 * Retourne la langue active du Kanban.
 * @returns {string} Langue active (`fr` ou `mg`).
 */
const getKanbanLanguage = () => {
    const db = getDatabase();
    const result = db.exec(`
        SELECT value
        FROM kanban_settings
        WHERE key = 'language'
        LIMIT 1;
    `);

    return result[0]?.values?.[0]?.[0] || "fr";
};

/**
 * Retourne toute la configuration Kanban.
 * @returns {{ language: string, columns: Array<object> }} Configuration Kanban.
 */
const getKanbanSettings = () => ({
    language: getKanbanLanguage(),
    columns: listKanbanColors()
});

/**
 * Met a jour une colonne Kanban et persiste la base.
 * @param {{ statusKey: string, color: string, titleMg: string }} params Donnees de mise a jour.
 * @returns {{ statusKey: string, title: string, titleMg: string, color: string, updatedAt: string } | undefined} Colonne mise a jour.
 */
const updateKanbanColumn = ({
    statusKey,
    color,
    titleMg
}) => {
    const db = getDatabase();
    const statement = db.prepare(`
        UPDATE kanban_colors
        SET color = ?, title_mg = ?, updated_at = CURRENT_TIMESTAMP
        WHERE status_key = ?;
    `);

    statement.run([
        color,
        titleMg,
        statusKey
    ]);
    statement.free();

    persistDatabase();

    return listKanbanColors().find(
        (item) => item.statusKey === statusKey
    );
};

/**
 * Met a jour plusieurs colonnes Kanban.
 * @param {Array<{ statusKey: string, color: string, titleMg: string }>} columns Colonnes a enregistrer.
 * @returns {Array<{ statusKey: string, title: string, titleMg: string, color: string, updatedAt: string }>} Colonnes apres sauvegarde.
 */
const updateKanbanColumns = (columns) => {
    columns.forEach(updateKanbanColumn);
    return listKanbanColors();
};

/**
 * Met a jour la langue active du Kanban.
 * @param {string} language Langue a enregistrer.
 * @returns {string} Langue sauvegardee.
 */
const updateKanbanLanguage = (language) => {
    const db = getDatabase();
    const statement = db.prepare(`
        INSERT INTO kanban_settings
            (key, value, updated_at)
        VALUES
            ('language', ?, CURRENT_TIMESTAMP)
        ON CONFLICT(key) DO UPDATE SET
            value = excluded.value,
            updated_at = CURRENT_TIMESTAMP;
    `);

    statement.run([language]);
    statement.free();

    persistDatabase();

    return getKanbanLanguage();
};

/**
 * Met a jour la configuration complete du Kanban.
 * @param {{ language: string, columns: Array<object> }} settings Configuration a sauvegarder.
 * @returns {{ language: string, columns: Array<object> }} Configuration apres sauvegarde.
 */
const updateKanbanSettings = ({
    language,
    columns
}) => {
    updateKanbanLanguage(language);
    updateKanbanColumns(columns);

    return getKanbanSettings();
};

module.exports = {
    getKanbanLanguage,
    getKanbanSettings,
    listKanbanColors,
    updateKanbanColumn,
    updateKanbanColumns,
    updateKanbanLanguage,
    updateKanbanSettings
};
