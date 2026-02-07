const { createHandlers } = require('./handlers');
const { handleError } = require('../utils/errors');

const makeCrud = (Model, initialOptions = {}) => {
    const options = {
        hooks: initialOptions.hooks || {},
        pagination: initialOptions.pagination || { defaultLimit: 10, maxLimit: 100 },
        middleware: initialOptions.middleware || {},
        operations: initialOptions.operations || ['getAll', 'getById', 'create', 'update', 'delete'],
        ...initialOptions
    };

    const handlers = createHandlers(Model, options);

    const builder = {
        beforeCreate: (fn) => { options.hooks.beforeCreate = fn; return builder; },
        afterCreate: (fn) => { options.hooks.afterCreate = fn; return builder; },
        beforeUpdate: (fn) => { options.hooks.beforeUpdate = fn; return builder; },
        pagination: (opts) => { options.pagination = { ...options.pagination, ...opts }; return builder; },
        middleware: (method, mws) => { options.middleware[method] = mws; return builder; },
        only: (list) => { options.operations = list; return builder; }
    };

    const allowedMethods = ['getAll', 'getById', 'create', 'update', 'delete'];

    allowedMethods.forEach(method => {
        Object.defineProperty(builder, method, {
            get: () => {
                if (!options.operations.includes(method)) return undefined;

                const mws = options.middleware[method] || [];
                if (mws.length === 0) return handlers[method];

                return async (req, res, next) => {
                    let index = 0;
                    const runMiddleware = async () => {
                        if (index < mws.length) {
                            const mw = mws[index++];
                            mw(req, res, runMiddleware);
                        } else {
                            await handlers[method](req, res, next);
                        }
                    };
                    try {
                        await runMiddleware();
                    } catch (err) {
                        handleError(res, err);
                    }
                };
            }
        });
    });

    return builder;
};

module.exports = { makeCrud };
