const allowedKanbanStatusKeys = [
    "new",
    "inProgress",
    "done"
];

const colorPattern = /^#[0-9A-Fa-f]{6}$/;

module.exports = {
    allowedKanbanStatusKeys,
    colorPattern
};
