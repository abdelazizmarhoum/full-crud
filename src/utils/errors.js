/**
 * Standardize Error Response for full-crud
 */
const handleError = (res, error) => {
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation Error',
            details: error.message
        });
    }

    if (error.name === 'CastError') {
        return res.status(400).json({
            success: false,
            error: 'Invalid ID format'
        });
    }

    if (error.code === 11000) {
        return res.status(409).json({
            success: false,
            error: 'Duplicate entry found'
        });
    }

    res.status(500).json({
        success: false,
        error: 'Server Error',
        message: error.message
    });
};

module.exports = { handleError };
