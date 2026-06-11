/**
 * Cles de statut Kanban autorisees pour la configuration couleur.
 * @type {string[]}
 */
const allowedKanbanStatusKeys = [
    "new",
    "inProgress",
    "done"
];

/**
 * Expression reguliere des couleurs hexadecimales acceptees.
 * @type {RegExp}
 */
const colorPattern = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
    allowedKanbanStatusKeys,
    colorPattern
};
