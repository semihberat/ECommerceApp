// src/routes/order.routes.js
const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Kullanıcının sepetini görüntüle
router.get('/cart', orderController.getCart);

// Sepete ürün ekle (AJAX)
router.post('/cart/add', authMiddleware.isAuthenticated, orderController.addToCart);

// Siparişi tamamla sayfası
router.get('/checkout', authMiddleware.isAuthenticated, orderController.getCheckout);

// Siparişi oluştur
router.post('/create', authMiddleware.isAuthenticated, orderController.createOrder);

// Sipariş başarılı sayfası
router.get('/success/:id', authMiddleware.isAuthenticated, orderController.getOrderSuccess);

// Kullanıcının siparişlerini listele
router.get('/my-orders', authMiddleware.isAuthenticated, orderController.getMyOrders);

// Sipariş detayını görüntüle
router.get('/:id', authMiddleware.isAuthenticated, orderController.getOrderDetails);

module.exports = router;
