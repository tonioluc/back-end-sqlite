const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const env = require("../config/env");
const { initializeSchema } = require("./schema");

let database = null;

const getSqlJs = async () => initSqlJs({
    locateFile: (file) => (
        path.join(__dirname, "../../node_modules/sql.js/dist", file)
    )
});

const ensureDatabaseDir = () => {
    fs.mkdirSync(
        path.dirname(env.databaseFile),
        { recursive: true }
    );
};

const loadDatabaseFile = (SQL) => {
    if (!fs.existsSync(env.databaseFile)) {
        return new SQL.Database();
    }

    const fileBuffer = fs.readFileSync(env.databaseFile);
    return new SQL.Database(fileBuffer);
};

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
