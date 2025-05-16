// src/middleware/auth.middleware.js
// Authentication middleware to protect routes

// Check if user is authenticated
exports.isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }

    // If not authenticated, redirect to login page
    return res.redirect('/users/login');
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.isAdmin) {
        return next();
    }

    // If not admin, redirect to home page
    return res.redirect('/');
};

// Make user data available to all views
exports.setLocals = (req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.isAuthenticated = req.session.user ? true : false;
    next();
};
