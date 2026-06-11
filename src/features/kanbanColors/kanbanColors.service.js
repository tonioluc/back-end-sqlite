const {
    allowedKanbanStatusKeys,
    allowedKanbanLanguages,
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
 * Verifie qu'une langue Kanban est supportee.
 * @param {string} language Langue a verifier.
 * @returns {boolean} `true` si la langue est supportee.
 */
const validateLanguage = (language) => (
    allowedKanbanLanguages.includes(language)
);

/**
 * Verifie qu'un titre malgache est exploitable.
 * @param {string} titleMg Titre malgache.
 * @returns {boolean} `true` si le titre est valide.
 */
const validateTitleMg = (titleMg) => (
    typeof titleMg === "string" &&
    titleMg.trim().length > 0 &&
    titleMg.trim().length <= 80
);

/**
 * Valide une demande de mise a jour de colonne Kanban.
 * @param {{ statusKey: string, color: string, titleMg: string }} params Donnees a valider.
 * @returns {void}
 * @throws {Error} Si le statut, la couleur ou le titre est invalide.
 */
const validateColumnUpdate = ({
    statusKey,
    color,
    titleMg
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

    if (!validateTitleMg(titleMg)) {
        const error = new Error("Le libelle malgache est obligatoire.");
        error.statusCode = 400;
        throw error;
    }
};

/**
 * Valide la langue active du Kanban.
 * @param {string} language Langue a valider.
 * @returns {void}
 * @throws {Error} Si la langue est invalide.
 */
const validateKanbanLanguage = (language) => {
    if (!validateLanguage(language)) {
        const error = new Error("Langue Kanban invalide.");
        error.statusCode = 400;
        throw error;
    }
};

/**
 * Retourne la configuration complete du Kanban.
 * @returns {{ language: string, columns: Array<object> }} Configuration Kanban.
 */
const listColors = () => repository.getKanbanSettings();

/**
 * Met a jour une colonne Kanban apres validation.
 * @param {{ statusKey: string, color: string, titleMg: string }} params Donnees de mise a jour.
 * @returns {object | undefined} Colonne mise a jour.
 */
const updateColor = ({
    statusKey,
    color,
    titleMg
}) => {
    validateColumnUpdate({
        statusKey,
        color,
        titleMg
    });

    return repository.updateKanbanColumn({
        statusKey,
        color,
        titleMg: titleMg.trim()
    });
};

/**
 * Met a jour toute la configuration Kanban apres validation.
 * @param {{ language: string, columns: Array<{ statusKey: string, color: string, titleMg: string }> }} settings Configuration a enregistrer.
 * @returns {{ language: string, columns: Array<object> }} Configuration apres sauvegarde.
 */
const updateColors = (settings) => {
    const language = settings?.language || "fr";
    const columns = settings?.columns;

    validateKanbanLanguage(language);

    if (!Array.isArray(columns)) {
        const error = new Error("La liste des colonnes est invalide.");
        error.statusCode = 400;
        throw error;
    }

    columns.forEach(validateColumnUpdate);

    return repository.updateKanbanSettings({
        language,
        columns: columns.map((column) => ({
            ...column,
            titleMg: column.titleMg.trim()
        }))
    });
};

module.exports = {
    listColors,
    updateColor,
    updateColors
};
