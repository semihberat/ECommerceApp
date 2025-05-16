// src/routes/product.routes.js
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Tüm ürünleri listele
router.get('/', productController.getAllProducts);

// Kategori bazında ürünleri listele
router.get('/category/:id', productController.getProductsByCategory);

// Ürün detayı
router.get('/:id', productController.getProductDetails);

// Admin - Ürün yönetimi (Admin middleware ile koruma altında)
router.get('/admin/add', authMiddleware.isAdmin, productController.getAddProduct);
router.post('/admin/add', authMiddleware.isAdmin, productController.addProduct);
router.get('/admin/edit/:id', authMiddleware.isAdmin, productController.getEditProduct);
router.post('/admin/edit/:id', authMiddleware.isAdmin, productController.updateProduct);
router.get('/admin/delete/:id', authMiddleware.isAdmin, productController.deleteProduct);

module.exports = router;
