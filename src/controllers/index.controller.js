// src/controllers/index.controller.js
const Product = require('../models/product.model');
const Category = require('../models/category.model');
const db = require('../config/database');

// Ana sayfa
exports.getHomePage = async (req, res) => {
    try {
        // En son eklenen 8 ürünü getir
        const [latestProducts] = await db.query(`
      SELECT p.*, 
             GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
             AVG(r.Rating) AS AverageRating
      FROM Products p
      LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
      LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
      LEFT JOIN Reviews r ON p.ProductID = r.ProductID
      GROUP BY p.ProductID
      ORDER BY p.CreatedAt DESC
      LIMIT 8
    `);

        // Fiyatları number tipine dönüştür
        latestProducts.forEach(product => {
            product.Price = parseFloat(product.Price);
        });

        // En çok satan 4 ürünü getir
        const [popularProducts] = await db.query(`
      SELECT p.*, 
             GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
             AVG(r.Rating) AS AverageRating,
             SUM(od.Quantity) AS TotalSold
      FROM Products p
      JOIN OrderDetails od ON p.ProductID = od.ProductID
      LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
      LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
      LEFT JOIN Reviews r ON p.ProductID = r.ProductID
      GROUP BY p.ProductID
      ORDER BY TotalSold DESC
      LIMIT 4
    `);

        // Fiyatları number tipine dönüştür
        popularProducts.forEach(product => {
            product.Price = parseFloat(product.Price);
        });

        // Tüm kategorileri getir
        const categories = await Category.findAll();

        res.render('home', {
            latestProducts,
            popularProducts,
            categories,
            user: req.session.user,
            title: 'Ana Sayfa - E-ticaret Sitemiz'
        });
    } catch (error) {
        console.error('Ana sayfa hatası:', error);
        res.render('home', {
            error: 'Ürünler yüklenirken bir hata oluştu.',
            latestProducts: [],
            popularProducts: [],
            categories: [],
            user: req.session.user,
            title: 'Ana Sayfa - E-ticaret Sitemiz'
        });
    }
};

// Arama
exports.search = async (req, res) => {
    try {
        const searchTerm = req.query.q;
        const categories = await Category.findAllWithProductCount();
        const products = await Product.search(searchTerm);

        // currentCategory değişkenini açıkça null olarak gönderiyoruz
        res.render('products/index', {
            products,
            categories,
            searchTerm,
            currentCategory: null,
            title: `Search Results: ${searchTerm}`
        });
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).render('error', {
            message: 'An error occurred during search',
            error
        });
    }
};

// Hakkımızda sayfası
exports.getAboutPage = (req, res) => {
    res.render('about', {
        title: 'Hakkımızda - E-ticaret Sitemiz',
        user: req.session.user
    });
};

// İletişim sayfası
exports.getContactPage = (req, res) => {
    res.render('contact', {
        title: 'İletişim - E-ticaret Sitemiz',
        user: req.session.user
    });
};

// İletişim formu gönderimi
exports.submitContactForm = (req, res) => {
    const { name, email, subject, message } = req.body;

    // Burada iletişim formu işleme kodları olacak
    // Email gönderme, veritabanına kaydetme vs.

    res.render('contact', {
        success: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
        title: 'İletişim - E-ticaret Sitemiz',
        user: req.session.user
    });
};
