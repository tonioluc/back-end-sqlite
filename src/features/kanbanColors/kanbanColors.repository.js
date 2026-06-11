const {
    getDatabase,
    persistDatabase
} = require("../../database/database");

const normalizeRow = (row) => ({
    statusKey: row[0],
    title: row[1],
    color: row[2],
    updatedAt: row[3]
});

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

const updateKanbanColors = (colors) => {
    colors.forEach(updateKanbanColor);
    return listKanbanColors();
};

module.exports = {
    listKanbanColors,
    updateKanbanColor,
    updateKanbanColors
};
