const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const env = require("../config/env");
const { initializeSchema } = require("./schema");

let database = null;

/**
 * Charge le moteur SQL.js avec le chemin local du fichier wasm.
 * @returns {Promise<any>} Module SQL.js initialise.
 */
const getSqlJs = async () => initSqlJs({
    locateFile: (file) => (
        path.join(__dirname, "../../node_modules/sql.js/dist", file)
    )
});

/**
 * Cree le dossier contenant le fichier SQLite s'il n'existe pas.
 * @returns {void}
 */
const ensureDatabaseDir = () => {
    fs.mkdirSync(
        path.dirname(env.databaseFile),
        { recursive: true }
    );
};

/**
 * Ouvre la base existante ou cree une nouvelle base en memoire.
 * @param {any} SQL Module SQL.js initialise.
 * @returns {import("sql.js").Database} Instance SQLite.
 */
const loadDatabaseFile = (SQL) => {
    if (!fs.existsSync(env.databaseFile)) {
        return new SQL.Database();
    }

    const fileBuffer = fs.readFileSync(env.databaseFile);
    return new SQL.Database(fileBuffer);
};

/**
 * Persiste la base SQL.js dans le fichier SQLite configure.
 * @returns {void}
 */
const persistDatabase = () => {
    if (!database) {
        return;
    }

    ensureDatabaseDir();
    fs.writeFileSync(
        env.databaseFile,
        Buffer.from(database.export())
    );
};

/**
 * Initialise la base, applique le schema et persiste les donnees par defaut.
 * @returns {Promise<import("sql.js").Database>} Instance SQLite initialisee.
 */
const initializeDatabase = async () => {
    if (database) {
        return database;
    }

    ensureDatabaseDir();

    const SQL = await getSqlJs();
    database = loadDatabaseFile(SQL);

    initializeSchema(database);
    persistDatabase();

    return database;
};

/**
 * Retourne l'instance SQLite deja initialisee.
 * @returns {import("sql.js").Database} Instance SQLite courante.
 * @throws {Error} Si la base n'a pas encore ete initialisee.
 */
const getDatabase = () => {
    if (!database) {
        throw new Error("La base SQLite n'est pas initialisee.");
    }

    return database;
};

module.exports = {
    getDatabase,
    initializeDatabase,
    persistDatabase
};
