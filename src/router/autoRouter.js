const fs = require('fs');
const path = require('path');
const { makeCrud } = require('../core/builder');

/**
 * Mount all CRUD routes for a model in one line
 */
const mountCrud = (app, routePath, Model, options = {}) => {
    const controller = makeCrud(Model, options);
    const registeredRoutes = [];

    const methods = ['getAll', 'getById', 'create', 'update', 'delete'];

    const routeMap = {
        getAll: { method: 'get', path: '/' },
        getById: { method: 'get', path: '/:id' },
        create: { method: 'post', path: '/' },
        update: { method: 'put', path: '/:id' },
        delete: { method: 'delete', path: '/:id' }
    };

    methods.forEach(m => {
        if (controller[m]) {
            const config = routeMap[m];
            const fullPath = `${routePath}${config.path}`.replace(/\/$/, '') || '/';
            app[config.method](fullPath, controller[m]);
            registeredRoutes.push({
                method: config.method.toUpperCase(),
                path: fullPath,
                handler: `${Model.modelName}.${m}`
            });
        }
    });

    return { controller, registeredRoutes };
};

/**
 * Automatically scan a folder for models and register routes
 */
const autowire = (app, modelsDir, options = {}) => {
    const { prefix = '/api', logging = true } = options;
    const fullPath = path.resolve(process.cwd(), modelsDir);
    const allRoutes = [];

    if (!fs.existsSync(fullPath)) {
        console.warn(`[full-crud] Autowire failed: Folder ${modelsDir} not found.`);
        return;
    }

    const files = fs.readdirSync(fullPath);

    files.forEach(file => {
        if (file.endsWith('.js')) {
            const Model = require(path.join(fullPath, file));

            if (Model.modelName) {
                const resourceName = file.replace('.js', '').toLowerCase();
                const pluralName = resourceName.endsWith('s') ? resourceName : `${resourceName}s`;

                const { registeredRoutes } = mountCrud(app, `${prefix}/${pluralName}`, Model, options);
                allRoutes.push(...registeredRoutes);
            }
        }
    });

    if (logging && allRoutes.length > 0) {
        console.log('\n🗺️  [full-crud] Generated Routes:');
        console.table(allRoutes);
        console.log('');
    }
};

module.exports = { mountCrud, autowire };
