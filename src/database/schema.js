const defaultKanbanColors = [
    {
        statusKey: "new",
        title: "Nouveau",
        color: "#cfe8ff"
    },
    {
        statusKey: "inProgress",
        title: "In progress",
        color: "#ffe6c7"
    },
    {
        statusKey: "done",
        title: "Termine",
        color: "#dff4df"
    }
];

const createSchema = (db) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS kanban_colors (
            status_key TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            color TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
};

const seedDefaultKanbanColors = (db) => {
    const statement = db.prepare(`
        INSERT OR IGNORE INTO kanban_colors
            (status_key, title, color, updated_at)
        VALUES
            (?, ?, ?, CURRENT_TIMESTAMP);
    `);

    defaultKanbanColors.forEach((item) => {
        statement.run([
            item.statusKey,
            item.title,
            item.color
        ]);
    });

    statement.free();
};

const initializeSchema = (db) => {
    createSchema(db);
    seedDefaultKanbanColors(db);
};

module.exports = {
    defaultKanbanColors,
    initializeSchema
};
