const path = require("path");

const rootDir = path.resolve(__dirname, "../..");

/**
 * Configuration runtime du backend SQLite.
 * @type {{ databaseFile: string, nodeEnv: string, port: number }}
 */
const env = {
    databaseFile: process.env.SQLITE_DATABASE_FILE ||
        path.join(rootDir, "data", "app.sqlite"),
    nodeEnv: process.env.NODE_ENV || "development",
    port: Number(process.env.PORT || 4000)
};

module.exports = env;
