const service = require("./kanbanColors.service");

/**
 * Repond avec la liste des couleurs Kanban configurees.
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
 * Met a jour la couleur d'une colonne Kanban.
 * @param {import("express").Request} request Requete Express.
 * @param {import("express").Response} response Reponse Express.
 * @returns {void}
 */
const updateColor = (request, response) => {
    const color = service.updateColor({
        statusKey: request.params.statusKey,
        color: request.body.color
    });

    response.json({
        data: color
    });
};

/**
 * Met a jour les couleurs des trois colonnes Kanban.
 * @param {import("express").Request} request Requete Express.
 * @param {import("express").Response} response Reponse Express.
 * @returns {void}
 */
const updateColors = (request, response) => {
    const colors = service.updateColors(
        request.body.colors
    );

    response.json({
        data: colors
    });
};

module.exports = {
    listColors,
    updateColor,
    updateColors
};
