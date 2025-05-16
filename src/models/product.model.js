// src/models/product.model.js
const db = require('../config/database');

class Product {
    // Tüm ürünleri listeleme
    static async findAll() {
        try {
            const [rows] = await db.query(`
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
               AVG(r.Rating) AS AverageRating,
               COUNT(DISTINCT r.ReviewID) AS ReviewCount
        FROM Products p
        LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
        LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
        LEFT JOIN Reviews r ON p.ProductID = r.ProductID
        GROUP BY p.ProductID
      `);

            // Fiyatları number tipine dönüştür
            rows.forEach(product => {
                if (product.Price) {
                    product.Price = parseFloat(product.Price);
                }
            });

            return rows;
        } catch (error) {
            console.error('Ürünleri listeleme hatası:', error);
            throw error;
        }
    }

    // ID ile ürün bulma
    static async findById(id) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
               AVG(r.Rating) AS AverageRating,
               COUNT(DISTINCT r.ReviewID) AS ReviewCount
        FROM Products p
        LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
        LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
        LEFT JOIN Reviews r ON p.ProductID = r.ProductID
        WHERE p.ProductID = ?
        GROUP BY p.ProductID
      `, [id]);

            // Fiyatı number tipine dönüştür
            if (rows[0] && rows[0].Price) {
                rows[0].Price = parseFloat(rows[0].Price);
            }

            return rows[0];
        } catch (error) {
            console.error('Ürün bulma hatası:', error);
            throw error;
        }
    }

    // Kategori bazında ürünleri listeleme
    static async findByCategory(categoryId) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
               AVG(r.Rating) AS AverageRating,
               COUNT(DISTINCT r.ReviewID) AS ReviewCount
        FROM Products p
        JOIN ProductCategories pc ON p.ProductID = pc.ProductID
        LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
        LEFT JOIN Reviews r ON p.ProductID = r.ProductID
        WHERE pc.CategoryID = ?
        GROUP BY p.ProductID
      `, [categoryId]);

            // Fiyatları number tipine dönüştür
            rows.forEach(product => {
                if (product.Price) {
                    product.Price = parseFloat(product.Price);
                }
            });

            return rows;
        } catch (error) {
            console.error('Kategori ürünlerini listeleme hatası:', error);
            throw error;
        }
    }

    // Yeni ürün ekleme
    static async create(productData) {
        try {
            const [result] = await db.query(
                'INSERT INTO Products (ProductName, Description, Price, Stock) VALUES (?, ?, ?, ?)',
                [productData.name, productData.description, productData.price, productData.stock]
            );

            // Ürünün kategorilerini ekle
            if (productData.categories && productData.categories.length > 0) {
                const productId = result.insertId;

                for (const categoryId of productData.categories) {
                    await db.query(
                        'INSERT INTO ProductCategories (ProductID, CategoryID) VALUES (?, ?)',
                        [productId, categoryId]
                    );
                }
            }

            return result.insertId;
        } catch (error) {
            console.error('Ürün ekleme hatası:', error);
            throw error;
        }
    }

    // Ürün güncelleme
    static async update(id, productData) {
        try {
            const [result] = await db.query(
                'UPDATE Products SET ProductName = ?, Description = ?, Price = ?, Stock = ? WHERE ProductID = ?',
                [productData.name, productData.description, productData.price, productData.stock, id]
            );

            // Ürünün kategorilerini güncelle (önce eski kategorileri temizle)
            if (productData.categories && productData.categories.length > 0) {
                await db.query('DELETE FROM ProductCategories WHERE ProductID = ?', [id]);

                for (const categoryId of productData.categories) {
                    await db.query(
                        'INSERT INTO ProductCategories (ProductID, CategoryID) VALUES (?, ?)',
                        [id, categoryId]
                    );
                }
            }

            return result.affectedRows > 0;
        } catch (error) {
            console.error('Ürün güncelleme hatası:', error);
            throw error;
        }
    }

    // Ürün silme
    static async delete(id) {
        try {
            // Ürün ilişkilerini temizle
            await db.query('DELETE FROM ProductCategories WHERE ProductID = ?', [id]);
            await db.query('DELETE FROM Reviews WHERE ProductID = ?', [id]);

            // Ürünü sil
            const [result] = await db.query('DELETE FROM Products WHERE ProductID = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) {
            console.error('Ürün silme hatası:', error);
            throw error;
        }
    }

    // Ürün arama
    static async search(searchTerm) {
        try {
            const [rows] = await db.query(`
        SELECT p.*, 
               GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
               AVG(r.Rating) AS AverageRating,
               COUNT(DISTINCT r.ReviewID) AS ReviewCount
        FROM Products p
        LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
        LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
        LEFT JOIN Reviews r ON p.ProductID = r.ProductID
        WHERE p.ProductName LIKE ? OR p.Description LIKE ?
        GROUP BY p.ProductID
      `, [`%${searchTerm}%`, `%${searchTerm}%`]);

            // Fiyatları number tipine dönüştür
            rows.forEach(product => {
                if (product.Price) {
                    product.Price = parseFloat(product.Price);
                }
            });

            return rows;
        } catch (error) {
            console.error('Ürün arama hatası:', error);
            throw error;
        }
    }
}

module.exports = Product;
