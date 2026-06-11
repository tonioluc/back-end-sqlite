const {
    getDatabase,
    persistDatabase
} = require("../../database/database");

/**
 * Convertit une ligne SQLite en objet de configuration Kanban.
 * @param {Array<any>} row Ligne issue de SQL.js.
 * @returns {{ statusKey: string, title: string, color: string, updatedAt: string }} Couleur normalisee.
 */
const normalizeRow = (row) => ({
    statusKey: row[0],
    title: row[1],
    color: row[2],
    updatedAt: row[3]
});

/**
 * Liste les couleurs Kanban dans l'ordre d'affichage des colonnes.
 * @returns {Array<{ statusKey: string, title: string, color: string, updatedAt: string }>} Couleurs Kanban.
 */
const listKanbanColors = () => {
    const db = getDatabase();
    const result = db.exec(`
        SELECT status_key, title, color, updated_at
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
 * Met a jour la couleur d'une colonne Kanban et persiste la base.
 * @param {{ statusKey: string, color: string }} params Donnees de mise a jour.
 * @returns {{ statusKey: string, title: string, color: string, updatedAt: string } | undefined} Couleur mise a jour.
 */
const updateKanbanColor = ({
    statusKey,
    color
}) => {
    const db = getDatabase();
    const statement = db.prepare(`
        UPDATE kanban_colors
        SET color = ?, updated_at = CURRENT_TIMESTAMP
        WHERE status_key = ?;
    `);

    statement.run([
        color,
        statusKey
    ]);
    statement.free();

    persistDatabase();

    return listKanbanColors().find(
        (item) => item.statusKey === statusKey
    );
};

/**
 * Met a jour plusieurs couleurs Kanban.
 * @param {Array<{ statusKey: string, color: string }>} colors Couleurs a enregistrer.
 * @returns {Array<{ statusKey: string, title: string, color: string, updatedAt: string }>} Couleurs apres sauvegarde.
 */
const updateKanbanColors = (colors) => {
    colors.forEach(updateKanbanColor);
    return listKanbanColors();
};

module.exports = {
    listKanbanColors,
    updateKanbanColor,
    updateKanbanColors
};
