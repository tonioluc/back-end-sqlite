const {
    getDatabase,
    persistDatabase
} = require("../../database/database");

const countRows = (db, tableName) => {
    const result = db.exec(`
        SELECT COUNT(*)
        FROM ${tableName};
    `);

    return Number(result[0]?.values[0]?.[0] || 0);
};

const deleteRows = (db, tableName) => {
    db.exec(`
        DELETE FROM ${tableName};
    `);
};

const resetCouts = () => {
    const db = getDatabase();
    const deleted = countRows(db, "couts");
    const deletedTicketRefs = countRows(db, "ticket_refs");

    deleteRows(db, "couts");
    deleteRows(db, "ticket_refs");
    persistDatabase();

    return {
        deleted,
        deletedTicketRefs
    };
};

module.exports = {
    resetCouts
};
