// src/models/user.model.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Yeni kullanıcı oluşturma
    static async create(userData) {
        try {
            // Şifreyi hashle
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            const [result] = await db.query(
                'INSERT INTO Users (UserName, Email, PasswordHash) VALUES (?, ?, ?)',
                [userData.username, userData.email, hashedPassword]
            );

            return result.insertId;
        } catch (error) {
            console.error('Kullanıcı oluşturma hatası:', error);
            throw error;
        }
    }

    // Email ile kullanıcı bulma
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM Users WHERE Email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('Kullanıcı bulma hatası:', error);
            throw error;
        }
    }

    // ID ile kullanıcı bulma
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM Users WHERE UserID = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Kullanıcı bulma hatası:', error);
            throw error;
        }
    }

    // Kullanıcı girişi doğrulama
    static async authenticate(email, password) {
        try {
            const user = await this.findByEmail(email);
            if (!user) return null;

            const passwordMatch = await bcrypt.compare(password, user.PasswordHash);
            if (!passwordMatch) return null;

            return user;
        } catch (error) {
            console.error('Kullanıcı doğrulama hatası:', error);
            throw error;
        }
    }

    // Kullanıcı bilgilerini güncelleme
    static async update(id, userData) {
        try {
            const [result] = await db.query(
                'UPDATE Users SET UserName = ?, Email = ? WHERE UserID = ?',
                [userData.username, userData.email, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Kullanıcı güncelleme hatası:', error);
            throw error;
        }
    }
}

module.exports = User;
