
const documentModule = require('../modules/document.module');

module.exports = function (app) {
    app.use('/api/documents',documentModule);
}