const service = require("./kanbanColors.service");

/**
 * Repond avec la configuration Kanban complete.
 * @param {import("express").Request} request Requete Express.
 * @param {import("express").Response} response Reponse Express.
 * @returns {void}
 */
const listColors = (request, response) => {
    response.json({
        data: service.listColors()
    });
};

/**
 * Met a jour une colonne Kanban.
 * @param {import("express").Request} request Requete Express.
 * @param {import("express").Response} response Reponse Express.
 * @returns {void}
 */
const updateColor = (request, response) => {
    const color = service.updateColor({
        statusKey: request.params.statusKey,
        color: request.body.color,
        titleMg: request.body.titleMg
    });

    response.json({
        data: color
    });
};

/**
 * Met a jour les couleurs, libelles malgaches et la langue active du Kanban.
 * @param {import("express").Request} request Requete Express.
 * @param {import("express").Response} response Reponse Express.
 * @returns {void}
 */
const updateColors = (request, response) => {
    const settings = service.updateColors({
        language: request.body.language,
        columns: request.body.columns || request.body.colors
    });

    response.json({
        data: settings
    });
};

module.exports = {
    listColors,
    updateColor,
    updateColors
};
