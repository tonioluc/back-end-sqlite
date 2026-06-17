const {
    getDatabase,
    persistDatabase
} = require("../../database/database");

const normalizeRow = (row) => ({
    idAuto: row[0],
    idTicket: row[1],
    typeCout: row[2],
    cout: row[3],
    idItem: row[4],
    idCategory: row[5],
    group: row[6]
});

const escapeSqlText = (value) => String(value).replaceAll("'", "''");

const listCouts = () => {
    const db = getDatabase();
    const result = db.exec(`
        SELECT id_auto, id_ticket, type_cout, cout, id_item, id_category, "group"
        FROM couts
        ORDER BY "group" DESC, id_auto DESC;
    `);

    return result[0]?.values.map(normalizeRow) || [];
};

const insertCoutRows = (rows) => {
    if (!rows.length) {
        return [];
    }

    const db = getDatabase();
    const statement = db.prepare(`
        INSERT INTO couts
            (id_ticket, type_cout, cout, id_item, id_category, "group")
        VALUES
            (?, ?, ?, ?, ?, ?);
    `);

    rows.forEach((row) => {
        statement.run([
            Number(row.idTicket),
            row.typeCout,
            Number(row.cout),
            String(row.idItem),
            String(row.idCategory),
            String(row.group)
        ]);
    });

    statement.free();
    persistDatabase();

    return listCouts().filter((row) => (
        row.group === String(rows[0].group) &&
        String(row.idTicket) === String(rows[0].idTicket) &&
        row.typeCout === rows[0].typeCout
    ));
};

const findLatestGroupRows = ({
    ticketId,
    typeCout
}) => {
    const db = getDatabase();
    const escapedTypeCout = escapeSqlText(typeCout);
    const groupResult = db.exec(`
        SELECT "group"
        FROM couts
        WHERE id_ticket = ${Number(ticketId)}
            AND type_cout = '${escapedTypeCout}'
        ORDER BY "group" DESC, id_auto DESC
        LIMIT 1;
    `);
    const group = groupResult[0]?.values[0]?.[0];

    if (!group) {
        return [];
    }

    const escapedGroup = escapeSqlText(group);
    const rowsResult = db.exec(`
        SELECT id_auto, id_ticket, type_cout, cout, id_item, id_category, "group"
        FROM couts
        WHERE id_ticket = ${Number(ticketId)}
            AND type_cout = '${escapedTypeCout}'
            AND "group" = '${escapedGroup}'
        ORDER BY id_auto ASC;
    `);

    return rowsResult[0]?.values.map(normalizeRow) || [];
};

const deleteLatestGroup = ({
    ticketId,
    typeCout
}) => {
    const rows = findLatestGroupRows({
        ticketId,
        typeCout
    });

    if (!rows.length) {
        return {
            deleted: 0,
            rows: []
        };
    }

    const db = getDatabase();
    const escapedTypeCout = escapeSqlText(typeCout);
    const escapedGroup = escapeSqlText(rows[0].group);

    db.run(`
        DELETE FROM couts
        WHERE id_ticket = ${Number(ticketId)}
            AND type_cout = '${escapedTypeCout}'
            AND "group" = '${escapedGroup}';
    `);
    persistDatabase();

    return {
        deleted: rows.length,
        rows
    };
};

const deleteAllCouts = () => {
    const db = getDatabase();
    const result = db.exec(`
        SELECT COUNT(*)
        FROM couts;
    `);
    const deleted = Number(result[0]?.values[0]?.[0] || 0);

    db.run("DELETE FROM couts;");
    persistDatabase();

    return {
        deleted
    };
};

const saveTicketRef = ({
    refTicket,
    idTicket
}) => {
    const db = getDatabase();
    const statement = db.prepare(`
        INSERT OR REPLACE INTO ticket_refs
            (ref_ticket, id_ticket)
        VALUES
            (?, ?);
    `);

    statement.run([
        String(refTicket),
        Number(idTicket)
    ]);

    statement.free();
    persistDatabase();

    return {
        refTicket,
        idTicket
    };
};

const findTicketRef = (refTicket) => {
    const db = getDatabase();
    const escapedRef = escapeSqlText(refTicket);
    const result = db.exec(`
        SELECT ref_ticket, id_ticket
        FROM ticket_refs
        WHERE ref_ticket = '${escapedRef}'
        LIMIT 1;
    `);
    const row = result[0]?.values[0];

    if (!row) {
        return null;
    }

    return {
        refTicket: row[0],
        idTicket: row[1]
    };
};

module.exports = {
    deleteAllCouts,
    deleteLatestGroup,
    findLatestGroupRows,
    findTicketRef,
    insertCoutRows,
    listCouts,
    saveTicketRef
};
