const { handleError } = require('../utils/errors');

/**
 * Creates the raw CRUD handlers for a Mongoose Model
 */
const createHandlers = (Model, options) => {
    return {
        getAll: async (req, res) => {
            try {
                const queryObj = { ...req.query };
                const excludedFields = ['page', 'sort', 'limit', 'fields'];
                excludedFields.forEach(el => delete queryObj[el]);

                let query = Model.find(queryObj);

                if (req.query.sort) {
                    const sortBy = req.query.sort.split(',').join(' ');
                    query = query.sort(sortBy);
                } else {
                    query = query.sort('-createdAt');
                }

                if (req.query.fields) {
                    const fields = req.query.fields.split(',').join(' ');
                    query = query.select(fields);
                }

                const page = parseInt(req.query.page, 10) || 1;
                const limit = Math.min(
                    parseInt(req.query.limit, 10) || options.pagination.defaultLimit,
                    options.pagination.maxLimit
                );
                const skip = (page - 1) * limit;

                const totalItems = Model.countDocuments ? await Model.countDocuments(queryObj) : (await Model.find(queryObj)).length;
                const totalPages = Math.ceil(totalItems / limit);

                const items = await query.skip(skip).limit(limit);

                res.status(200).json({
                    success: true,
                    count: items.length,
                    pagination: { page, limit, totalPages, totalItems },
                    data: items
                });
            } catch (err) {
                handleError(res, err);
            }
        },

        getById: async (req, res) => {
            try {
                const item = await Model.findById(req.params.id);
                if (!item) return res.status(404).json({ success: false, error: 'Resource not found' });
                res.status(200).json({ success: true, data: item });
            } catch (err) {
                handleError(res, err);
            }
        },

        create: async (req, res) => {
            try {
                let data = { ...req.body };
                if (options.hooks.beforeCreate) data = await options.hooks.beforeCreate(data, req);
                const item = await Model.create(data);
                if (options.hooks.afterCreate) await options.hooks.afterCreate(item, req);
                res.status(201).json({ success: true, message: 'Resource created successfully', data: item });
            } catch (err) {
                handleError(res, err);
            }
        },

        update: async (req, res) => {
            try {
                let data = { ...req.body };
                if (options.hooks.beforeUpdate) data = await options.hooks.beforeUpdate(data, req);
                const item = await Model.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
                if (!item) return res.status(404).json({ success: false, error: 'Resource not found' });
                res.status(200).json({ success: true, message: 'Resource updated successfully', data: item });
            } catch (err) {
                handleError(res, err);
            }
        },

        delete: async (req, res) => {
            try {
                const item = await Model.findByIdAndDelete(req.params.id);
                if (!item) return res.status(404).json({ success: false, error: 'Resource not found' });
                res.status(200).json({ success: true, message: 'Resource deleted successfully', data: null });
            } catch (err) {
                handleError(res, err);
            }
        }
    };
};

module.exports = { createHandlers };
