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

const saveTicketRef = (request, response) => {
    response.status(201).json({
        data: service.saveTicketRef(request.body)
    });
};

const findTicketRef = (request, response) => {
    response.json({
        data: service.findTicketRef(request.params.refTicket)
    });
};

module.exports = {
    createCoutReouverture,
    createCoutSaisi,
    deleteLatestCoutSaisi,
    findTicketRef,
    listCouts,
    saveTicketRef
};
