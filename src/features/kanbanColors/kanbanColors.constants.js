/**
 * Cles de statut Kanban autorisees pour la configuration.
 * @type {string[]}
 */
const allowedKanbanStatusKeys = [
    "new",
    "inProgress",
    "done"
];

/**
 * Langues supportees pour l'affichage du Kanban.
 * @type {string[]}
 */
const allowedKanbanLanguages = [
    "fr",
    "mg"
];

/**
 * Expression reguliere des couleurs hexadecimales acceptees.
 * @type {RegExp}
 */
const colorPattern = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
    allowedKanbanLanguages,
    allowedKanbanStatusKeys,
    colorPattern
};
