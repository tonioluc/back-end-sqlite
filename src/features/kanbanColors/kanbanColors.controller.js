const service = require("./kanbanColors.service");

const listColors = (request, response) => {
    response.json({
        data: service.listColors()
    });
};

const updateColor = (request, response) => {
    const color = service.updateColor({
        statusKey: request.params.statusKey,
        color: request.body.color
    });

    response.json({
        data: color
    });
};

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
