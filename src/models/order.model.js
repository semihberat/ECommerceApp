// src/models/order.model.js
const db = require('../config/database');

class Order {
    // Yeni sipariş oluşturma
    static async create(orderData) {
        try {
            // Veritabanı transaction başlat
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // Ana sipariş kaydını oluştur
                const [orderResult] = await connection.query(
                    'INSERT INTO Orders (UserID, TotalAmount) VALUES (?, ?)',
                    [orderData.userId, orderData.totalAmount]
                );

                const orderId = orderResult.insertId;

                // Sipariş detaylarını ekle
                for (const item of orderData.items) {
                    await connection.query(
                        'INSERT INTO OrderDetails (OrderID, ProductID, Quantity, Price) VALUES (?, ?, ?, ?)',
                        [orderId, item.productId, item.quantity, item.price]
                    );
                }

                // Ödeme bilgilerini ekle
                if (orderData.payment) {
                    await connection.query(
                        'INSERT INTO Payments (OrderID, Amount, PaymentMethod) VALUES (?, ?, ?)',
                        [orderId, orderData.totalAmount, orderData.payment.method]
                    );
                }

                // Kargo bilgilerini ekle
                if (orderData.shipping) {
                    await connection.query(
                        'INSERT INTO Shippings (OrderID, ShippingAddress, Status) VALUES (?, ?, ?)',
                        [orderId, orderData.shipping.address, 'Hazırlanıyor']
                    );
                }

                // Transaction'ı tamamla
                await connection.commit();
                connection.release();

                return orderId;
            } catch (error) {
                // Hata durumunda rollback yap
                await connection.rollback();
                connection.release();
                throw error;
            }
        } catch (error) {
            console.error('Sipariş oluşturma hatası:', error);
            throw error;
        }
    }

    // Kullanıcının siparişlerini getirme
    static async findByUser(userId) {
        try {
            const [rows] = await db.query(`
        SELECT o.*, 
               COUNT(od.OrderDetailID) as ItemCount,
               s.Status as ShippingStatus
        FROM Orders o
        LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
        LEFT JOIN Shippings s ON o.OrderID = s.OrderID
        WHERE o.UserID = ?
        GROUP BY o.OrderID
        ORDER BY o.OrderDate DESC
      `, [userId]);
            return rows;
        } catch (error) {
            console.error('Kullanıcı siparişleri getirme hatası:', error);
            throw error;
        }
    }

    // Sipariş detaylarını getirme
    static async findById(orderId) {
        try {
            // Sipariş ana bilgileri
            const [orderRows] = await db.query(`
        SELECT o.*, 
               s.Status as ShippingStatus,
               s.ShippingAddress,
               p.PaymentMethod
        FROM Orders o
        LEFT JOIN Shippings s ON o.OrderID = s.OrderID
        LEFT JOIN Payments p ON o.OrderID = p.OrderID
        WHERE o.OrderID = ?
      `, [orderId]);

            if (!orderRows.length) return null;

            const order = orderRows[0];

            // Sipariş detayları
            const [itemRows] = await db.query(`
        SELECT od.*, p.ProductName, p.ProductID
        FROM OrderDetails od
        JOIN Products p ON od.ProductID = p.ProductID
        WHERE od.OrderID = ?
      `, [orderId]);

            order.items = itemRows;

            return order;
        } catch (error) {
            console.error('Sipariş detayı getirme hatası:', error);
            throw error;
        }
    }

    // Sipariş durumu güncelleme
    static async updateStatus(orderId, status) {
        try {
            const [result] = await db.query(
                'UPDATE Shippings SET Status = ? WHERE OrderID = ?',
                [status, orderId]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Sipariş durumu güncelleme hatası:', error);
            throw error;
        }
    }
}

module.exports = Order;
