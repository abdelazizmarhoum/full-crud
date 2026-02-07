/**
 * full-crud: Master Test Suite
 */
const { makeCrud } = require('./src/index');

// Mock Mongoose Model
// We allow a simpler mock here for unit testing without MongoDB connection
const createMockModel = () => {
    let db = [];
    let nextId = 1;

    // Chainable Query Helper
    const createQuery = (data) => {
        let results = [...data];
        const query = {
            sort(s) { return this; },
            select(s) {
                if (s) {
                    const fields = s.split(' ');
                    results = results.map(item => {
                        const newItem = {};
                        fields.forEach(f => {
                            if (f.startsWith('-')) {
                                // simplified ignore for mock
                            } else {
                                newItem[f] = item[f];
                            }
                        });
                        return newItem;
                    });
                }
                return this;
            },
            skip(n) { results = results.slice(n); return this; },
            limit(n) { results = results.slice(0, n); return this; },
            then(resolve) { resolve(results); },
            catch(reject) { }
        };
        // Object.assign(query, Promise.resolve(results));
        return query;
    };

    return {
        db,
        find: (filter = {}) => {
            const filtered = db.filter(item => {
                return Object.keys(filter).every(key => item[key] === filter[key]);
            });
            return createQuery(filtered);
        },
        findById: async (id) => db.find(item => item._id === id),
        countDocuments: async (filter = {}) => {
            return db.filter(item => {
                return Object.keys(filter).every(key => item[key] === filter[key]);
            }).length;
        },
        create: async (data) => {
            const newItem = { _id: String(nextId++), createdAt: new Date(), ...data };
            db.push(newItem);
            return newItem;
        },
        findByIdAndUpdate: async (id, data) => {
            const idx = db.findIndex(i => i._id === id);
            if (idx === -1) return null;
            db[idx] = { ...db[idx], ...data };
            return db[idx];
        },
        findByIdAndDelete: async (id) => {
            const idx = db.findIndex(i => i._id === id);
            if (idx === -1) return null;
            return db.splice(idx, 1)[0];
        }
    };
};

const mockReqRes = () => {
    const req = { params: {}, body: {}, query: {} };
    const res = {
        statusCode: 200,
        body: null,
        status(code) { this.statusCode = code; return this; },
        json(data) { this.body = data; return this; }
    };
    return { req, res };
};

const runTests = async () => {
    console.log('🚀 Starting Full-Crud Tests...');

    // --- PHASE 1 RECAP ---
    const Model = createMockModel();
    const controller = makeCrud(Model);

    // 1. Test Create
    {
        const { req, res } = mockReqRes();
        req.body = { name: 'Item 1' };
        await controller.create(req, res);
        console.assert(res.statusCode === 201, 'Create 201');
        console.log('✅ Create Passed');
    }

    // --- PHASE 2: HOOKS ---
    console.log('\n🪝 Testing Hooks...');
    {
        const ModelHooks = createMockModel();
        let hookTriggered = false;
        const controllerHooks = makeCrud(ModelHooks, {
            hooks: {
                beforeCreate: async (data) => {
                    data.hashed = true;
                    return data;
                },
                afterCreate: async (doc) => {
                    hookTriggered = true;
                }
            }
        });

        const { req, res } = mockReqRes();
        req.body = { name: 'Hook Test' };
        await controllerHooks.create(req, res);
        console.assert(res.body.data.hashed === true, 'beforeCreate hook failed');
        console.assert(hookTriggered === true, 'afterCreate hook failed');
        console.log('✅ Hooks Passed');
    }

    // --- PHASE 2: PAGINATION & FILTERING ---
    console.log('\n📖 Testing Pagination & Filtering...');
    {
        const ModelPag = createMockModel();
        const controllerPag = makeCrud(ModelPag);

        // Seed 15 items
        for (let i = 1; i <= 15; i++) {
            await ModelPag.create({ name: `Item ${i}`, category: i % 2 === 0 ? 'A' : 'B' });
        }

        // Test Pagination
        const { req, res } = mockReqRes();
        req.query = { page: '2', limit: '5' };
        await controllerPag.getAll(req, res);
        console.assert(res.body.pagination.page === 2, 'Page check failed');
        console.assert(res.body.data.length === 5, 'Limit check failed');
        console.assert(res.body.pagination.totalItems === 15, 'Total items check failed');
        console.log('✅ Pagination Passed');

        // Test Filtering
        const { req: reqF, res: resF } = mockReqRes();
        reqF.query = { category: 'A' };
        await controllerPag.getAll(reqF, resF);
        console.assert(resF.body.pagination.totalItems === 7, 'Filtering failed');
        console.log('✅ Filtering Passed');
    }

    // --- PHASE 4: CHAINABLE API ---
    console.log('\n🔗 Testing Chainable API...');
    {
        let chainHookTriggered = false;
        const ModelChain = createMockModel();
        // The one-liner chain!
        const controllerChain = makeCrud(ModelChain)
            .beforeCreate(data => { data.chained = true; return data; })
            .afterCreate(doc => { chainHookTriggered = true; })
            .only(['create', 'getById']);

        // Test Chained Hook
        const { req, res } = mockReqRes();
        req.body = { name: 'Chain Test' };
        await controllerChain.create(req, res);
        console.assert(res.body.data.chained === true, 'Chain hook failed');
        console.assert(chainHookTriggered === true, 'Chain afterCreate failed');

        // Test Chained Restriction
        console.assert(controllerChain.getAll === undefined, 'Chain restriction failed');
        console.log('✅ Chainable API Passed');
    }

    // --- PHASE 5: AUTO-ROUTER (mountCrud) ---
    console.log('\n🚀 Testing mountCrud...');
    {
        const ModelMount = createMockModel();
        const mockApp = {
            routes: [],
            get(p, h) { this.routes.push({ method: 'GET', path: p }); },
            post(p, h) { this.routes.push({ method: 'POST', path: p }); },
            put(p, h) { this.routes.push({ method: 'PUT', path: p }); },
            delete(p, h) { this.routes.push({ method: 'DELETE', path: p }); }
        };

        const { mountCrud } = require('./src/index');
        mountCrud(mockApp, '/api/test', ModelMount);

        console.assert(mockApp.routes.length === 5, 'mountCrud failed to register all routes');
        console.assert(mockApp.routes.some(r => r.path === '/api/test/'), 'mountCrud root path failed');
        console.assert(mockApp.routes.some(r => r.path === '/api/test/:id'), 'mountCrud ID path failed');
        console.log('✅ mountCrud Passed');
    }

    console.log('\n✨ All Phase 1-5 Tests Passed!');
};

runTests().catch(err => {
    console.error('❌ Test Suite Failed');
    console.error(err);
    process.exit(1);
});
