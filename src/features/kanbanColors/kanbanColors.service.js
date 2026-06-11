const {
    allowedKanbanStatusKeys,
    colorPattern
} = require("./kanbanColors.constants");
const repository = require("./kanbanColors.repository");

const isAllowedStatusKey = (statusKey) => (
    allowedKanbanStatusKeys.includes(statusKey)
);

const validateColor = (color) => (
    typeof color === "string" &&
    colorPattern.test(color)
);

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

const listColors = () => repository.listKanbanColors();

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
