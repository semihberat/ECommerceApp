// src/app.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = process.env.PORT || 3000;
// Admin rotalarını ekle
const adminRoutes = require('./routes/admin.routes');
const adminMiddleware = require('./middleware/admin.middleware');
// Veritabanı bağlantısını içe aktarma
const db = require('./config/database');

// Middleware ayarları
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make sure we have a session secret
const sessionSecret = process.env.SESSION_SECRET || 'ecommerce_fallback_secret_key';

// Use the same secret for cookies and session
app.use(cookieParser(sessionSecret));

app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // HTTPS kullanıyorsanız true yapın
}));

// Auth middleware - tüm şablonlarda kullanıcı verilerini erişilebilir kıl
const authMiddleware = require('./middleware/auth.middleware');
app.use(authMiddleware.setLocals);
app.use(adminMiddleware.setLocals);

// Statik dosyalar için public klasörü
app.use(express.static(path.join(__dirname, '../public')));

// EJS view engine ayarı
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

// Routes
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const orderRoutes = require('./routes/order.routes');
const indexRoutes = require('./routes/index.routes');

app.use('/', indexRoutes);
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/admin', adminRoutes);
// 404 - Sayfa Bulunamadı
app.use((req, res) => {
    res.status(404).render('404', { title: 'Sayfa Bulunamadı' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});
