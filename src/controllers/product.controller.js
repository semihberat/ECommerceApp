// src/controllers/product.controller.js
const Product = require('../models/product.model');
const Category = require('../models/category.model');

// Tüm ürünleri listeleme
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.findAll();
        const categories = await Category.findAll();

        res.render('products/index', {
            products,
            categories,
            currentCategory: null,
            title: 'Tüm Ürünler'
        });
    } catch (error) {
        console.error('Ürünleri listeleme hatası:', error);
        res.render('products/index', {
            error: 'Ürünler yüklenirken bir hata oluştu.',
            products: [],
            categories: [],
            title: 'Tüm Ürünler'
        });
    }
};

// Kategori bazında ürünleri listeleme
exports.getProductsByCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.redirect('/products');
        }

        const products = await Product.findByCategory(categoryId);
        const categories = await Category.findAll();

        res.render('products/index', {
            products,
            categories,
            currentCategory: category,
            title: `${category.CategoryName} Ürünleri`
        });
    } catch (error) {
        console.error('Kategori ürünlerini listeleme hatası:', error);
        res.redirect('/products');
    }
};

// Ürün detaylarını görüntüleme
exports.getProductDetails = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.redirect('/products');
        }

        res.render('products/details', {
            product,
            title: product.ProductName
        });
    } catch (error) {
        console.error('Ürün detayı görüntüleme hatası:', error);
        res.redirect('/products');
    }
};

// Admin - Yeni ürün ekleme sayfası
exports.getAddProduct = async (req, res) => {
    try {
        // Sadece admin kullanıcıları erişebilir
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/');
        }

        const categories = await Category.findAll();

        res.render('admin/add-product', {
            categories,
            title: 'Yeni Ürün Ekle'
        });
    } catch (error) {
        console.error('Ürün ekleme sayfası hatası:', error);
        res.redirect('/admin/products');
    }
};

// Admin - Ürün ekleme işlemi
exports.addProduct = async (req, res) => {
    try {
        // Sadece admin kullanıcıları erişebilir
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/');
        }

        const { name, description, price, stock, categories } = req.body;

        // Basit doğrulama
        if (!name || !price || !stock) {
            const allCategories = await Category.findAll();
            return res.render('admin/add-product', {
                error: 'Ürün adı, fiyat ve stok bilgileri gereklidir',
                categories: allCategories,
                values: { name, description, price, stock, categories },
                title: 'Yeni Ürün Ekle'
            });
        }

        // Yeni ürün oluştur
        const productId = await Product.create({
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categories: Array.isArray(categories) ? categories : [categories]
        });

        res.redirect(`/products/${productId}`);
    } catch (error) {
        console.error('Ürün ekleme hatası:', error);
        res.redirect('/admin/products');
    }
};

// Admin - Ürün düzenleme sayfası
exports.getEditProduct = async (req, res) => {
    try {
        // Sadece admin kullanıcıları erişebilir
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/');
        }

        const productId = req.params.id;
        const product = await Product.findById(productId);

        if (!product) {
            return res.redirect('/admin/products');
        }

        const categories = await Category.findAll();

        res.render('admin/edit-product', {
            product,
            categories,
            title: `${product.ProductName} Düzenle`
        });
    } catch (error) {
        console.error('Ürün düzenleme sayfası hatası:', error);
        res.redirect('/admin/products');
    }
};

// Admin - Ürün güncelleme işlemi
exports.updateProduct = async (req, res) => {
    try {
        // Sadece admin kullanıcıları erişebilir
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/');
        }

        const productId = req.params.id;
        const { name, description, price, stock, categories } = req.body;

        // Basit doğrulama
        if (!name || !price || !stock) {
            return res.redirect(`/admin/products/edit/${productId}`);
        }

        // Ürünü güncelle
        const success = await Product.update(productId, {
            name,
            description,
            price: parseFloat(price),
            stock: parseInt(stock),
            categories: Array.isArray(categories) ? categories : [categories]
        });

        if (success) {
            res.redirect(`/products/${productId}`);
        } else {
            res.redirect(`/admin/products/edit/${productId}`);
        }
    } catch (error) {
        console.error('Ürün güncelleme hatası:', error);
        res.redirect('/admin/products');
    }
};

// Admin - Ürün silme işlemi
exports.deleteProduct = async (req, res) => {
    try {
        // Sadece admin kullanıcıları erişebilir
        if (!req.session.user || !req.session.user.isAdmin) {
            return res.redirect('/');
        }

        const productId = req.params.id;

        // Ürünü sil
        const success = await Product.delete(productId);

        res.redirect('/admin/products');
    } catch (error) {
        console.error('Ürün silme hatası:', error);
        res.redirect('/admin/products');
    }
};
