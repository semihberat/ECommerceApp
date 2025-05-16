// src/models/admin.model.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    // Email ile admin bulma
    static async findByEmail(email) {
        try {
            const [rows] = await db.query('SELECT * FROM Admins WHERE Email = ?', [email]);
            return rows[0];
        } catch (error) {
            console.error('Admin bulma hatası:', error);
            throw error;
        }
    }

    // ID ile admin bulma
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM Admins WHERE AdminID = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Admin bulma hatası:', error);
            throw error;
        }
    }

    // Tüm adminleri getirme
    static async findAll() {
        try {
            const [rows] = await db.query(`
                SELECT AdminID, AdminName, Email, Role, LastLogin, IsActive, CreatedAt 
                FROM Admins
                ORDER BY AdminID DESC
            `);
            return rows;
        } catch (error) {
            console.error('Adminleri getirme hatası:', error);
            throw error;
        }
    }

    // Yeni admin oluşturma
    static async create(adminData) {
        try {
            const hashedPassword = await bcrypt.hash(adminData.password, 10);

            const [result] = await db.query(
                'INSERT INTO Admins (AdminName, Email, PasswordHash, Role, IsActive) VALUES (?, ?, ?, ?, ?)',
                [adminData.adminName, adminData.email, hashedPassword, adminData.role, true]
            );

            return result.insertId;
        } catch (error) {
            console.error('Admin oluşturma hatası:', error);
            throw error;
        }
    }

    // Admin girişi doğrulama
    static async authenticate(email, password) {
        try {
            const admin = await this.findByEmail(email);
            if (!admin) return null;

            const passwordMatch = await bcrypt.compare(password, admin.PasswordHash);
            if (!passwordMatch) return null;

            return admin;
        } catch (error) {
            console.error('Admin doğrulama hatası:', error);
            throw error;
        }
    }

    // Şifreyi değiştirme
    static async changePassword(id, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const [result] = await db.query(
                'UPDATE Admins SET PasswordHash = ? WHERE AdminID = ?',
                [hashedPassword, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Şifre değiştirme hatası:', error);
            throw error;
        }
    }
}

module.exports = Admin;
