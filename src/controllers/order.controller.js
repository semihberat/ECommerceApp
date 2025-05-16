// src/controllers/order.controller.js
const Order = require('../models/order.model');
const Product = require('../models/product.model');

// Sepet sayfasını göster
exports.getCart = (req, res) => {
    res.render('cart', {
        title: 'Sepetim'
    });
};

// Sepete ürün ekle (AJAX)
exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        // Ürünün stokta olup olmadığını kontrol et
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
        }

        if (product.Stock < quantity) {
            return res.status(400).json({ success: false, message: 'Yetersiz stok' });
        }

        // Gerçek dünyada burada sepet işlemleri (veritabanı, session, vb.) yapılır
        // Basitlik için burada sadece başarılı cevap dönüyoruz
        // Frontend'de localStorage ile sepet yönetimi yapılıyor

        res.json({
            success: true,
            message: 'Ürün sepete eklendi',
            product: {
                id: product.ProductID,
                name: product.ProductName,
                price: product.Price,
                image: product.ProductImage || '/images/placeholder.jpg'
            }
        });
    } catch (error) {
        console.error('Sepete ekleme hatası:', error);
        res.status(500).json({ success: false, message: 'Bir hata oluştu' });
    }
};

// Ödeme sayfasını göster
exports.getCheckout = async (req, res) => {
    try {
        // Gerçek uygulamada, sepet bilgileri veritabanından veya session'dan alınır
        // Bu örnekte, frontend'den gelen ürün id'leri ile işlem yapıyoruz
        const productIds = req.query.products ? req.query.products.split(',') : [];
        const quantities = req.query.quantities ? req.query.quantities.split(',') : [];

        if (!productIds.length) {
            return res.redirect('/orders/cart');
        }

        // Ürün detaylarını getir
        const checkoutItems = [];
        let totalAmount = 0;

        for (let i = 0; i < productIds.length; i++) {
            const product = await Product.findById(productIds[i]);

            if (product) {
                const quantity = parseInt(quantities[i] || 1);
                const itemTotal = product.Price * quantity;

                checkoutItems.push({
                    product,
                    quantity,
                    total: itemTotal
                });

                totalAmount += itemTotal;
            }
        }

        res.render('checkout', {
            title: 'Siparişi Tamamla',
            checkoutItems,
            totalAmount
        });
    } catch (error) {
        console.error('Checkout sayfası hatası:', error);
        res.redirect('/orders/cart');
    }
};

// Sipariş oluştur
exports.createOrder = async (req, res) => {
    try {
        const { products, quantities, shippingAddress, paymentMethod } = req.body;

        if (!products || !quantities || !Array.isArray(products) || !Array.isArray(quantities)) {
            return res.redirect('/orders/cart');
        }

        // Ürün detaylarını ve toplam tutarı hesapla
        const orderItems = [];
        let totalAmount = 0;

        for (let i = 0; i < products.length; i++) {
            const product = await Product.findById(products[i]);

            if (product) {
                const quantity = parseInt(quantities[i]);
                const itemPrice = product.Price;
                const itemTotal = itemPrice * quantity;

                orderItems.push({
                    productId: product.ProductID,
                    quantity,
                    price: itemPrice
                });

                totalAmount += itemTotal;
            }
        }

        // Sipariş oluştur
        const orderData = {
            userId: req.session.user.id,
            totalAmount,
            items: orderItems,
            payment: {
                method: paymentMethod
            },
            shipping: {
                address: shippingAddress
            }
        };

        const orderId = await Order.create(orderData);

        // Sipariş başarılı sayfasına yönlendir
        res.redirect(`/orders/success/${orderId}`);
    } catch (error) {
        console.error('Sipariş oluşturma hatası:', error);
        res.redirect('/orders/checkout');
    }
};

// Sipariş başarılı sayfası
exports.getOrderSuccess = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order || order.UserID !== req.session.user.id) {
            return res.redirect('/orders/my-orders');
        }

        res.render('order-success', {
            title: 'Sipariş Başarılı',
            order
        });
    } catch (error) {
        console.error('Sipariş başarılı sayfası hatası:', error);
        res.redirect('/orders/my-orders');
    }
};

// Siparişlerim sayfası
exports.getMyOrders = async (req, res) => {
    try {
        const userId = req.session.user.id;
        const orders = await Order.findByUser(userId);

        res.render('my-orders', {
            title: 'Siparişlerim',
            orders
        });
    } catch (error) {
        console.error('Siparişlerim sayfası hatası:', error);
        res.render('my-orders', {
            title: 'Siparişlerim',
            orders: [],
            error: 'Siparişleriniz yüklenirken bir hata oluştu.'
        });
    }
};

// Sipariş detayı sayfası
exports.getOrderDetails = async (req, res) => {
    try {
        const orderId = req.params.id;
        const order = await Order.findById(orderId);

        if (!order || order.UserID !== req.session.user.id) {
            return res.redirect('/orders/my-orders');
        }

        res.render('order-details', {
            title: 'Sipariş Detayı #' + orderId,
            order
        });
    } catch (error) {
        console.error('Sipariş detayı sayfası hatası:', error);
        res.redirect('/orders/my-orders');
    }
};
