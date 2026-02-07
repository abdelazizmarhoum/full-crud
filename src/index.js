/**
 * full-crud: The "One-Line" Express/Mongoose CRUD Factory
 */

const { makeCrud } = require('./core/builder');
const { mountCrud, autowire } = require('./router/autoRouter');
const { handleError } = require('./utils/errors');

module.exports = {
    makeCrud,
    mountCrud,
    autowire,
    handleError
};
