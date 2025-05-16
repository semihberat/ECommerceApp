const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin {
    // Admin kimlik doğrulama
    static async authenticate(email, password) {
        try {
            const [rows] = await db.query('SELECT * FROM Admins WHERE Email = ? AND IsActive = TRUE', [email]);
            const admin = rows[0];

            if (!admin) {
                return null;
            }

            const isMatch = await bcrypt.compare(password, admin.PasswordHash);
            if (!isMatch) {
                return null;
            }

            // Son giriş tarihini güncelle
            await db.query('UPDATE Admins SET LastLogin = CURRENT_TIMESTAMP WHERE AdminID = ?', [admin.AdminID]);

            // Şifreyi çıkarıp admin bilgilerini döndür
            delete admin.PasswordHash;
            return admin;
        } catch (error) {
            console.error('Admin kimlik doğrulama hatası:', error);
            throw error;
        }
    }

    // ID ile admin bulma
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM Admins WHERE AdminID = ?', [id]);
            if (rows.length === 0) return null;

            const admin = rows[0];
            delete admin.PasswordHash; // Şifreyi çıkar
            return admin;
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
                'INSERT INTO Admins (AdminName, Email, PasswordHash, Role) VALUES (?, ?, ?, ?)',
                [adminData.adminName, adminData.email, hashedPassword, adminData.role]
            );

            return result.insertId;
        } catch (error) {
            console.error('Admin oluşturma hatası:', error);
            throw error;
        }
    }

    // Admin güncelleme
    static async update(id, adminData) {
        try {
            const [result] = await db.query(
                'UPDATE Admins SET AdminName = ?, Email = ?, Role = ?, IsActive = ? WHERE AdminID = ?',
                [adminData.adminName, adminData.email, adminData.role, adminData.isActive, id]
            );

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Admin güncelleme hatası:', error);
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