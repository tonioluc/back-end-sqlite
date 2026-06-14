const defaultKanbanColors = [
    {
        statusKey: "new",
        title: "Nouveau",
        titleMg: "Vaovao",
        color: "#cfe8ff"
    },
    {
        statusKey: "inProgress",
        title: "In progress",
        titleMg: "Efa manao",
        color: "#ffe6c7"
    },
    {
        statusKey: "done",
        title: "Termine",
        titleMg: "Vita",
        color: "#dff4df"
    }
];

/**
 * Indique si une colonne existe deja dans une table SQLite.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @param {string} tableName Nom de table.
 * @param {string} columnName Nom de colonne.
 * @returns {boolean} `true` si la colonne existe.
 */
const columnExists = (db, tableName, columnName) => {
    const result = db.exec(`PRAGMA table_info(${tableName});`);
    const rows = result[0]?.values || [];

    return rows.some((row) => row[1] === columnName);
};

/**
 * Cree les tables necessaires a la configuration Kanban.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @returns {void}
 */
const createSchema = (db) => {
    db.run(`
        CREATE TABLE IF NOT EXISTS kanban_colors (
            status_key TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            title_mg TEXT NOT NULL DEFAULT '',
            color TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS kanban_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
    db.run(`
        CREATE TABLE IF NOT EXISTS couts (
            id_auto INTEGER PRIMARY KEY AUTOINCREMENT,
            id_ticket INTEGER NOT NULL,
            type_cout TEXT NOT NULL,
            cout REAL NOT NULL,
            id_item TEXT NOT NULL,
            id_category TEXT NOT NULL,
            "group" TEXT NOT NULL
        );
    `);
};

/**
 * Applique les migrations simples sur une base deja existante.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @returns {void}
 */
const migrateSchema = (db) => {
    if (!columnExists(db, "kanban_colors", "title_mg")) {
        db.run(`
            ALTER TABLE kanban_colors
            ADD COLUMN title_mg TEXT NOT NULL DEFAULT '';
        `);
    }

    db.run("DROP TABLE IF EXISTS super_couts;");
    db.run("DROP TABLE IF EXISTS reouverture_couts;");
};

/**
 * Insere les couleurs Kanban par defaut si elles n'existent pas encore.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @returns {void}
 */
const seedDefaultKanbanColors = (db) => {
    const insertStatement = db.prepare(`
        INSERT OR IGNORE INTO kanban_colors
            (status_key, title, title_mg, color, updated_at)
        VALUES
            (?, ?, ?, ?, CURRENT_TIMESTAMP);
    `);
    const titleStatement = db.prepare(`
        UPDATE kanban_colors
        SET title_mg = ?
        WHERE status_key = ? AND (title_mg IS NULL OR title_mg = '');
    `);

    defaultKanbanColors.forEach((item) => {
        insertStatement.run([
            item.statusKey,
            item.title,
            item.titleMg,
            item.color
        ]);

        titleStatement.run([
            item.titleMg,
            item.statusKey
        ]);
    });

    insertStatement.free();
    titleStatement.free();
};

/**
 * Insere les parametres Kanban par defaut si besoin.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @returns {void}
 */
const seedDefaultKanbanSettings = (db) => {
    db.run(`
        INSERT OR IGNORE INTO kanban_settings
            (key, value, updated_at)
        VALUES
            ('language', 'fr', CURRENT_TIMESTAMP);
    `);
};

/**
 * Prepare la base en creant le schema, les migrations et les donnees initiales.
 * @param {import("sql.js").Database} db Instance SQLite.
 * @returns {void}
 */
const initializeSchema = (db) => {
    createSchema(db);
    migrateSchema(db);
    seedDefaultKanbanColors(db);
    seedDefaultKanbanSettings(db);
};

module.exports = {
    defaultKanbanColors,
    initializeSchema
};
