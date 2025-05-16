// src/config/database.js
const mysql = require('mysql2/promise');

// Veritabanı havuzu oluşturma
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "ecommerceapp",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Veritabanı bağlantısını test et
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('Veritabanı bağlantısı başarılı!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Veritabanı bağlantı hatası:', error);
        return false;
    }
}

// Uygulamanız başladığında bağlantıyı test edin
testConnection();

module.exports = pool;
