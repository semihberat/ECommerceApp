// Admin yetkilendirme middleware'i
exports.isAdmin = (req, res, next) => {
    // Admin oturumu var mı kontrol et
    if (!req.session.admin) {
        return res.redirect('/admin/login');
    }

    // Admin aktif mi kontrol et
    if (!req.session.admin.IsActive) {
        req.session.admin = null;
        return res.redirect('/admin/login');
    }

    next();
};

// SuperAdmin yetkisi kontrolü
exports.isSuperAdmin = (req, res, next) => {
    if (!req.session.admin || req.session.admin.Role !== 'SuperAdmin') {
        return res.status(403).render('admin/error', {
            title: 'Yetkisiz Erişim',
            message: 'Bu sayfaya erişim yetkiniz bulunmamaktadır.',
            admin: req.session.admin,
            layout: 'admin/layout'
        });
    }

    next();
};

// Tüm sayfalarda admin değişkenini ata
exports.setLocals = (req, res, next) => {
    res.locals.admin = req.session.admin || null;
    next();
};