// src/models/category.model.js
const db = require('../config/database');

class Category {
    // Tüm kategorileri listeleme
    static async findAll() {
        try {
            const [rows] = await db.query(`
        SELECT c.*, COUNT(pc.ProductID) as ProductCount
        FROM Categories c
        LEFT JOIN ProductCategories pc ON c.CategoryID = pc.CategoryID
        GROUP BY c.CategoryID
      `);
            return rows;
        } catch (error) {
            console.error('Kategorileri listeleme hatası:', error);
            throw error;
        }
    }

    // Tüm kategorileri ürün sayısıyla birlikte listeleme
    static async findAllWithProductCount() {
        try {
            const [rows] = await db.query(`
        SELECT c.*, COUNT(pc.ProductID) as ProductCount
        FROM Categories c
        LEFT JOIN ProductCategories pc ON c.CategoryID = pc.CategoryID
        GROUP BY c.CategoryID
      `);
            return rows;
        } catch (error) {
            console.error('Kategorileri listeleme hatası:', error);
            throw error;
        }
    }

    // ID ile kategori bulma
    static async findById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM Categories WHERE CategoryID = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Kategori bulma hatası:', error);
            throw error;
        }
    }

    // Yeni kategori ekleme
    static async create(categoryData) {
        try {
            const [result] = await db.query(
                'INSERT INTO Categories (CategoryName) VALUES (?)',
                [categoryData.name]
            );
            return result.insertId;
        } catch (error) {
            console.error('Kategori ekleme hatası:', error);
            throw error;
        }
    }

    // Kategori güncelleme
    static async update(id, categoryData) {
        try {
            const [result] = await db.query(
                'UPDATE Categories SET CategoryName = ? WHERE CategoryID = ?',
                [categoryData.name, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Kategori güncelleme hatası:', error);
            throw error;
        }
    }

    // Kategori silme
    static async delete(id) {
        try {
            // Kategori ilişkilerini temizle
            await db.query('DELETE FROM ProductCategories WHERE CategoryID = ?', [id]);

            // Kategoriyi sil
            const [result] = await db.query('DELETE FROM Categories WHERE CategoryID = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Kategori silme hatası:', error);
            throw error;
        }
    }
}

module.exports = Category;
