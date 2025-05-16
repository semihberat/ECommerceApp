const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const adminMiddleware = require('../middleware/admin.middleware');

// Admin Authentication
router.get('/login', adminController.getLoginPage);
router.post('/login', adminController.login);
router.get('/logout', adminController.logout);

// Admin koruma middleware'i
router.use(adminMiddleware.isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboard);
router.get('/', (req, res) => res.redirect('/admin/dashboard'));

// Ürün Yönetimi
router.get('/products', adminController.getProducts);
router.get('/products/add', adminController.getAddProductForm);
router.post('/products/add', adminController.addProduct);
router.get('/products/edit/:id', adminController.getEditProductForm);
router.post('/products/edit/:id', adminController.updateProduct);
router.get('/products/delete/:id', adminController.deleteProduct);

// Kategori Yönetimi
router.get('/categories', adminController.getCategories);
router.get('/categories/add', adminController.getAddCategoryForm);
router.post('/categories/add', adminController.addCategory);

// Sipariş Yönetimi
router.get('/orders', adminController.getOrders);
router.get('/orders/:id', adminController.getOrderDetails);
router.post('/orders/:id/status', adminController.updateOrderStatus);

// Kullanıcı Yönetimi
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserDetails);

// Admin Yönetimi
router.get('/admins', adminMiddleware.isSuperAdmin, adminController.getAdmins);
router.get('/admins/add', adminMiddleware.isSuperAdmin, adminController.getAddAdminForm);
router.post('/admins/add', adminMiddleware.isSuperAdmin, adminController.addAdmin);

// Profil Yönetimi
router.get('/change-password', adminController.getChangePasswordForm);
router.post('/change-password', adminController.changePassword);

module.exports = router;