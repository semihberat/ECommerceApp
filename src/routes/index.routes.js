// src/routes/index.routes.js
const express = require('express');
const router = express.Router();
const indexController = require('../controllers/index.controller');

// Ana sayfa
router.get('/', indexController.getHomePage);

// Arama
router.get('/search', indexController.search);

// Hakkımızda
router.get('/about', indexController.getAboutPage);

// İletişim
router.get('/contact', indexController.getContactPage);
router.post('/contact', indexController.submitContactForm);

module.exports = router;
