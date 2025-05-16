// src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Kullanıcı kaydı
router.get('/register', (req, res) => {
    res.render('register', { title: 'Kayıt Ol' });
});
router.post('/register', userController.register);

// Kullanıcı girişi
router.get('/login', (req, res) => {
    res.render('login', {
        title: 'Giriş Yap',
        success: req.query.success === 'true' ? 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.' : null
    });
});
router.post('/login', userController.login);

// Kullanıcı çıkışı
router.get('/logout', userController.logout);

// Kullanıcı profili - giriş yapmış kullanıcılar erişebilir
router.get('/profile', authMiddleware.isAuthenticated, userController.profile);
router.post('/profile', authMiddleware.isAuthenticated, userController.updateProfile);

module.exports = router;
