const mongoose = require('mongoose');

// Guards DB-backed routes. If Mongo isn't connected (readyState 1 = connected),
// respond immediately with a clean 503 instead of letting Mongoose buffer the query
// for 10s and then throw the ugly "... buffering timed out" error.
module.exports = function dbReady(req, res, next) {
    if (mongoose.connection.readyState === 1) return next();
    return res.status(503).json({
        error: 'Cannot reach the database right now. Please try again in a moment.',
    });
};
