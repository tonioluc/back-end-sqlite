const service = require("./reset.service");

const resetCouts = (request, response) => {
    response.json({
        data: service.resetCouts()
    });
};

module.exports = {
    resetCouts
};
