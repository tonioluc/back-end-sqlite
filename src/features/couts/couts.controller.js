const service = require("./couts.service");

const listCouts = (request, response) => {
    response.json({
        data: service.listCouts()
    });
};

const createCoutSaisi = (request, response) => {
    response.status(201).json({
        data: service.createCoutSaisi(request.body)
    });
};

const createCoutReouverture = (request, response) => {
    response.status(201).json({
        data: service.createCoutReouverture(request.body)
    });
};

const deleteLatestCoutSaisi = (request, response) => {
    response.json({
        data: service.deleteLatestCoutSaisi(request.params.ticketId)
    });
};

module.exports = {
    createCoutReouverture,
    createCoutSaisi,
    deleteLatestCoutSaisi,
    listCouts
};
