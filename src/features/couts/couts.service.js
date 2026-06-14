const repository = require("./couts.repository");
const { COUT_TYPES } = require("./couts.constants");

const toFiniteNumber = (value) => {
    const number = Number(value);

    return Number.isFinite(number)
        ? number
        : null;
};

const createBadRequest = (message) => {
    const error = new Error(message);
    error.statusCode = 400;

    return error;
};

const validateTicketId = (ticketId) => {
    if (!ticketId) {
        throw createBadRequest("Le ticket est obligatoire.");
    }
};

const validateGroup = (group) => {
    if (!group) {
        throw createBadRequest("Le groupe est obligatoire.");
    }
};

const validateItems = (items) => {
    if (!Array.isArray(items) || items.length === 0) {
        throw createBadRequest("Au moins un element lie au ticket est obligatoire.");
    }

    items.forEach((item) => {
        if (!item.idItem || !item.idCategory) {
            throw createBadRequest("Chaque element doit avoir un id et une categorie.");
        }
    });
};

const listCouts = () => repository.listCouts();

const createCoutSaisi = ({
    ticketId,
    cout,
    items,
    group
}) => {
    validateTicketId(ticketId);
    validateGroup(group);
    validateItems(items);

    const total = toFiniteNumber(cout);

    if (total === null || total < 0) {
        throw createBadRequest("Le cout est invalide.");
    }

    const coutParElement = total / items.length;

    return repository.insertCoutRows(
        items.map((item) => ({
            idTicket: ticketId,
            typeCout: COUT_TYPES.saisie,
            cout: coutParElement,
            idItem: item.idItem,
            idCategory: item.idCategory,
            group
        }))
    );
};

const deleteLatestCoutSaisi = (ticketId) => {
    validateTicketId(ticketId);

    return repository.deleteLatestGroup({
        ticketId,
        typeCout: COUT_TYPES.saisie
    });
};

const createCoutReouverture = ({
    ticketId,
    pourcentage,
    group
}) => {
    validateTicketId(ticketId);
    validateGroup(group);

    const ratio = toFiniteNumber(pourcentage);

    if (ratio === null || ratio < 0) {
        throw createBadRequest("Le pourcentage de reouverture est invalide.");
    }

    const lastRows = repository.findLatestGroupRows({
        ticketId,
        typeCout: COUT_TYPES.saisie
    });

    if (!lastRows.length) {
        throw createBadRequest("Aucun cout saisi trouve pour ce ticket.");
    }

    return repository.insertCoutRows(
        lastRows.map((row) => ({
            idTicket: ticketId,
            typeCout: COUT_TYPES.reouverture,
            cout: Number(row.cout || 0) * ratio / 100,
            idItem: row.idItem,
            idCategory: row.idCategory,
            group
        }))
    );
};

const deleteAllCouts = () => repository.deleteAllCouts();

module.exports = {
    createCoutReouverture,
    createCoutSaisi,
    deleteAllCouts,
    deleteLatestCoutSaisi,
    listCouts
};
