const Admin = require('../models/admin.model');
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const Order = require('../models/order.model');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

// Admin Login Sayfası
exports.getLoginPage = (req, res) => {
    res.render('admin/login', {
        title: 'Admin Girişi',
        layout: 'admin/layout'
    });
};

// Admin Login İşlemi
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basit doğrulama
        if (!email || !password) {
            return res.render('admin/login', {
                error: 'Email ve şifre gereklidir',
                values: { email },
                title: 'Admin Girişi',
                layout: 'admin/layout'
            });
        }

        // Admin hesabını doğrula
        const admin = await Admin.authenticate(email, password);
        if (!admin) {
            return res.render('admin/login', {
                error: 'Geçersiz email veya şifre',
                values: { email },
                title: 'Admin Girişi',
                layout: 'admin/layout'
            });
        }

        // Admin oturum bilgisini sakla
        req.session.admin = admin;
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Admin giriş hatası:', error);
        res.render('admin/login', {
            error: 'Bir hata oluştu. Lütfen tekrar deneyin.',
            values: { email: req.body.email },
            title: 'Admin Girişi',
            layout: 'admin/layout'
        });
    }
};

// Admin Çıkış İşlemi
exports.logout = (req, res) => {
    req.session.admin = null;
    res.redirect('/admin/login');
};

// Dashboard Sayfası
exports.getDashboard = async (req, res) => {
    try {
        // İstatistikleri getir
        const productCount = await Product.getCount();
        const orderCount = await Order.getCount();
        const userCount = await User.getCount();
        const categoryCount = await Category.getCount();

        // Son 5 siparişi getir
        const recentOrders = await Order.getRecent(5);

        // Düşük stoklu ürünleri getir (stok < 10)
        const lowStockProducts = await Product.getLowStock(10);

        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            admin: req.session.admin,
            stats: {
                productCount,
                orderCount,
                userCount,
                categoryCount
            },
            recentOrders,
            lowStockProducts,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Dashboard hatası:', error);
        res.render('admin/dashboard', {
            title: 'Admin Dashboard',
            admin: req.session.admin,
            error: 'Dashboard verilerini yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Ürün Yönetimi //

// Ürün Listesi
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        res.render('admin/products/index', {
            title: 'Ürün Yönetimi',
            admin: req.session.admin,
            products,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Ürün listesi hatası:', error);
        res.render('admin/products/index', {
            title: 'Ürün Yönetimi',
            admin: req.session.admin,
            products: [],
            error: 'Ürünleri yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Ürün Ekle Formu
exports.getAddProductForm = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('admin/products/add', {
            title: 'Yeni Ürün Ekle',
            admin: req.session.admin,
            categories,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Ürün ekleme formu hatası:', error);
        res.redirect('/admin/products');
    }
};

// Ürün Ekleme
exports.addProduct = async (req, res) => {
    try {
        const { productName, description, price, stock, categories } = req.body;

        // Resim yükleme işlemleri burada yapılabilir
        const imageURL = req.file ? `/uploads/${req.file.filename}` : null;

        // Ürünü veritabanına ekle
        const productId = await Product.create({
            productName,
            description,
            price,
            stock,
            imageURL
        });

        // Kategorileri ekle
        if (categories && categories.length > 0) {
            await Product.addCategories(productId, Array.isArray(categories) ? categories : [categories]);
        }

        res.redirect('/admin/products');
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        const categories = await Category.findAll();
        res.render('admin/products/add', {
            title: 'Yeni Ürün Ekle',
            admin: req.session.admin,
            categories,
            error: 'Ürün eklenirken bir hata oluştu.',
            values: req.body,
            layout: 'admin/layout'
        });
    }
};

// Ürün Düzenleme Formu
exports.getEditProductForm = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const categories = await Category.findAll();
        const productCategories = await Product.getCategories(productId);

        if (!product) {
            return res.redirect('/admin/products');
        }

        res.render('admin/products/edit', {
            title: 'Ürün Düzenle',
            admin: req.session.admin,
            product,
            categories,
            productCategories: productCategories.map(c => c.CategoryID),
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Ürün düzenleme formu hatası:', error);
        res.redirect('/admin/products');
    }
};

// Ürün Güncelleme
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const { productName, description, price, stock, categories } = req.body;

        // Resim yükleme işlemleri
        let imageURL = req.body.currentImage;
        if (req.file) {
            imageURL = `/uploads/${req.file.filename}`;
        }

        // Ürünü güncelle
        await Product.update(productId, {
            productName,
            description,
            price,
            stock,
            imageURL
        });

        // Kategorileri güncelle
        await Product.removeAllCategories(productId);
        if (categories && categories.length > 0) {
            await Product.addCategories(productId, Array.isArray(categories) ? categories : [categories]);
        }

        res.redirect('/admin/products');
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        res.redirect(`/admin/products/edit/${req.params.id}`);
    }
};

// Ürün Silme
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        await Product.delete(productId);
        res.redirect('/admin/products');
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        res.redirect('/admin/products');
    }
};

// Kategori Yönetimi //

// Kategori Listesi
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.render('admin/categories/index', {
            title: 'Kategori Yönetimi',
            admin: req.session.admin,
            categories,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Kategori listesi hatası:', error);
        res.render('admin/categories/index', {
            title: 'Kategori Yönetimi',
            admin: req.session.admin,
            categories: [],
            error: 'Kategorileri yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Kategori Ekle Formu
exports.getAddCategoryForm = (req, res) => {
    res.render('admin/categories/add', {
        title: 'Yeni Kategori Ekle',
        admin: req.session.admin,
        layout: 'admin/layout'
    });
};

// Kategori Ekleme
exports.addCategory = async (req, res) => {
    try {
        const { categoryName, description } = req.body;
        await Category.create({
            categoryName,
            description
        });
        res.redirect('/admin/categories');
    } catch (error) {
        console.error('Kategori ekleme hatası:', error);
        res.render('admin/categories/add', {
            title: 'Yeni Kategori Ekle',
            admin: req.session.admin,
            error: 'Kategori eklenirken bir hata oluştu.',
            values: req.body,
            layout: 'admin/layout'
        });
    }
};

// Sipariş Yönetimi //

// Sipariş Listesi
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.findAll();
        res.render('admin/orders/index', {
            title: 'Sipariş Yönetimi',
            admin: req.session.admin,
            orders,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Sipariş listesi hatası:', error);
        res.render('admin/orders/index', {
            title: 'Sipariş Yönetimi',
            admin: req.session.admin,
            orders: [],
            error: 'Siparişleri yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Sipariş Detayı
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);
        const orderDetails = await Order.getOrderDetails(orderId);

        if (!order) {
            return res.redirect('/admin/orders');
        }

        res.render('admin/orders/details', {
            title: 'Sipariş Detayı',
            admin: req.session.admin,
            order,
            orderDetails,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Sipariş detayı hatası:', error);
        res.redirect('/admin/orders');
    }
};

// Sipariş Durumu Güncelleme
exports.updateOrderStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body;

        await Order.updateStatus(orderId, status);
        res.redirect(`/admin/orders/${orderId}`);
    } catch (error) {
        console.error('Sipariş durumu güncelleme hatası:', error);
        res.redirect(`/admin/orders/${req.params.id}`);
    }
};

// Kullanıcı Yönetimi //

// Kullanıcı Listesi
exports.getUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.render('admin/users/index', {
            title: 'Kullanıcı Yönetimi',
            admin: req.session.admin,
            users,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Kullanıcı listesi hatası:', error);
        res.render('admin/users/index', {
            title: 'Kullanıcı Yönetimi',
            admin: req.session.admin,
            users: [],
            error: 'Kullanıcıları yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Kullanıcı Detayı
exports.getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        const userOrders = await Order.findByUser(userId);

        if (!user) {
            return res.redirect('/admin/users');
        }

        res.render('admin/users/details', {
            title: 'Kullanıcı Detayı',
            admin: req.session.admin,
            user,
            userOrders,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Kullanıcı detayı hatası:', error);
        res.redirect('/admin/users');
    }
};

// Admin Yönetimi //

// Admin Listesi
exports.getAdmins = async (req, res) => {
    try {
        const admins = await Admin.findAll();
        res.render('admin/admins/index', {
            title: 'Admin Yönetimi',
            admin: req.session.admin,
            admins,
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Admin listesi hatası:', error);
        res.render('admin/admins/index', {
            title: 'Admin Yönetimi',
            admin: req.session.admin,
            admins: [],
            error: 'Adminleri yüklerken bir hata oluştu.',
            layout: 'admin/layout'
        });
    }
};

// Admin Ekle Formu
exports.getAddAdminForm = (req, res) => {
    res.render('admin/admins/add', {
        title: 'Yeni Admin Ekle',
        admin: req.session.admin,
        layout: 'admin/layout'
    });
};

// Admin Ekleme
exports.addAdmin = async (req, res) => {
    try {
        const { adminName, email, password, role } = req.body;

        // Basit doğrulama
        if (!adminName || !email || !password || !role) {
            return res.render('admin/admins/add', {
                title: 'Yeni Admin Ekle',
                admin: req.session.admin,
                error: 'Tüm alanlar gereklidir',
                values: { adminName, email, role },
                layout: 'admin/layout'
            });
        }

        // Yeni admin oluştur
        await Admin.create({
            adminName,
            email,
            password,
            role
        });

        res.redirect('/admin/admins');
    } catch (error) {
        console.error('Admin ekleme hatası:', error);
        res.render('admin/admins/add', {
            title: 'Yeni Admin Ekle',
            admin: req.session.admin,
            error: 'Admin eklenirken bir hata oluştu.',
            values: req.body,
            layout: 'admin/layout'
        });
    }
};

// Şifre Değiştirme Formu
exports.getChangePasswordForm = (req, res) => {
    res.render('admin/change-password', {
        title: 'Şifre Değiştir',
        admin: req.session.admin,
        layout: 'admin/layout'
    });
};

// Şifre Değiştirme
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // Basit doğrulama
        if (!currentPassword || !newPassword || !confirmPassword) {
            return res.render('admin/change-password', {
                title: 'Şifre Değiştir',
                admin: req.session.admin,
                error: 'Tüm alanlar gereklidir',
                layout: 'admin/layout'
            });
        }

        if (newPassword !== confirmPassword) {
            return res.render('admin/change-password', {
                title: 'Şifre Değiştir',
                admin: req.session.admin,
                error: 'Yeni şifreler eşleşmiyor',
                layout: 'admin/layout'
            });
        }

        // Mevcut admin bilgilerini al
        const adminId = req.session.admin.AdminID;
        const [rows] = await db.query('SELECT * FROM Admins WHERE AdminID = ?', [adminId]);
        const admin = rows[0];

        // Mevcut şifreyi doğrula
        const isMatch = await bcrypt.compare(currentPassword, admin.PasswordHash);
        if (!isMatch) {
            return res.render('admin/change-password', {
                title: 'Şifre Değiştir',
                admin: req.session.admin,
                error: 'Mevcut şifre yanlış',
                layout: 'admin/layout'
            });
        }

        // Şifreyi güncelle
        await Admin.changePassword(adminId, newPassword);

        res.render('admin/change-password', {
            title: 'Şifre Değiştir',
            admin: req.session.admin,
            success: 'Şifreniz başarıyla değiştirildi',
            layout: 'admin/layout'
        });
    } catch (error) {
        console.error('Şifre değiştirme hatası:', error);
        res.render('admin/change-password', {
            title: 'Şifre Değiştir',
            admin: req.session.admin,
            error: 'Şifre değiştirilirken bir hata oluştu',
            layout: 'admin/layout'
        });
    }
};

module.exports = exports;