const {
    allowedKanbanStatusKeys,
    colorPattern
} = require("./kanbanColors.constants");
const repository = require("./kanbanColors.repository");

/**
 * Verifie qu'une cle de statut fait partie des colonnes Kanban gerees.
 * @param {string} statusKey Cle de statut Kanban.
 * @returns {boolean} `true` si la cle est autorisee.
 */
const isAllowedStatusKey = (statusKey) => (
    allowedKanbanStatusKeys.includes(statusKey)
);

/**
 * Verifie qu'une couleur est au format hexadecimal attendu.
 * @param {string} color Couleur a verifier.
 * @returns {boolean} `true` si la couleur est valide.
 */
const validateColor = (color) => (
    typeof color === "string" &&
    colorPattern.test(color)
);

/**
 * Valide une demande de mise a jour de couleur Kanban.
 * @param {{ statusKey: string, color: string }} params Donnees a valider.
 * @returns {void}
 * @throws {Error} Si le statut ou la couleur est invalide.
 */
const validateColorUpdate = ({
    statusKey,
    color
}) => {
    if (!isAllowedStatusKey(statusKey)) {
        const error = new Error("Statut Kanban invalide.");
        error.statusCode = 400;
        throw error;
    }

    if (!validateColor(color)) {
        const error = new Error("La couleur doit etre au format hex #RRGGBB.");
        error.statusCode = 400;
        throw error;
    }
};

/**
 * Retourne la configuration de couleurs Kanban.
 * @returns {Array<object>} Couleurs Kanban.
 */
const listColors = () => repository.listKanbanColors();

/**
 * Met a jour une couleur Kanban apres validation.
 * @param {{ statusKey: string, color: string }} params Donnees de mise a jour.
 * @returns {object | undefined} Couleur mise a jour.
 */
const updateColor = ({
    statusKey,
    color
}) => {
    validateColorUpdate({
        statusKey,
        color
    });

    return repository.updateKanbanColor({
        statusKey,
        color
    });
};

/**
 * Met a jour toutes les couleurs Kanban apres validation.
 * @param {Array<{ statusKey: string, color: string }>} colors Couleurs a enregistrer.
 * @returns {Array<object>} Couleurs apres sauvegarde.
 */
const updateColors = (colors) => {
    if (!Array.isArray(colors)) {
        const error = new Error("La liste des couleurs est invalide.");
        error.statusCode = 400;
        throw error;
    }

    colors.forEach(validateColorUpdate);

    return repository.updateKanbanColors(colors);
};

module.exports = {
    listColors,
    updateColor,
    updateColors
};
