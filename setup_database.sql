-- E-commerce Database Schema (Revised)

-- Database creation
CREATE DATABASE IF NOT EXISTS ecommerceapp;
USE ecommerceapp;

-- Drop existing tables to avoid conflicts (if re-running the script)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS OrderDetails;
DROP TABLE IF EXISTS Payments;
DROP TABLE IF EXISTS Shippings;
DROP TABLE IF EXISTS Orders;
DROP TABLE IF EXISTS Reviews;
DROP TABLE IF EXISTS ProductCategories;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Categories;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS Admins;
DROP TABLE IF EXISTS ShoppingCart;
DROP TABLE IF EXISTS CartItems;
DROP TABLE IF EXISTS Wishlist;
DROP TABLE IF EXISTS Coupons;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table (enhanced with more fields)
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    UserName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    FirstName VARCHAR(50),
    LastName VARCHAR(50),
    PhoneNumber VARCHAR(20),
    Address TEXT,
    City VARCHAR(50),
    PostalCode VARCHAR(20),
    Country VARCHAR(50),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_user_email (Email)
);

-- Products table (with additional fields)
CREATE TABLE Products (
    ProductID INT AUTO_INCREMENT PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10, 2) NOT NULL,
    Stock INT NOT NULL DEFAULT 0,
    ImageURL VARCHAR(255),
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_product_name (ProductName),
    INDEX idx_product_price (Price)
);

-- Categories table
CREATE TABLE Categories (
    CategoryID INT AUTO_INCREMENT PRIMARY KEY,
    CategoryName VARCHAR(100) NOT NULL,
    Description TEXT,
    ParentCategoryID INT,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ParentCategoryID) REFERENCES Categories(CategoryID) ON DELETE SET NULL,
    INDEX idx_category_name (CategoryName)
);

-- ProductCategories join table
CREATE TABLE ProductCategories (
    ProductCategoryID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    CategoryID INT NOT NULL,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (CategoryID) REFERENCES Categories(CategoryID) ON DELETE CASCADE,
    UNIQUE INDEX idx_product_category (ProductID, CategoryID)
);

-- Orders table (with order status)
CREATE TABLE Orders (
    OrderID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    OrderDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    TotalAmount DECIMAL(10, 2) NOT NULL,
    OrderStatus ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_order_user (UserID),
    INDEX idx_order_date (OrderDate),
    INDEX idx_order_status (OrderStatus)
);

-- OrderDetails table
CREATE TABLE OrderDetails (
    OrderDetailID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE RESTRICT,
    INDEX idx_orderdetail_order (OrderID),
    INDEX idx_orderdetail_product (ProductID)
);

-- Shopping Cart table
CREATE TABLE ShoppingCart (
    CartID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    UNIQUE INDEX idx_cart_user (UserID)
);

-- Cart Items table
CREATE TABLE CartItems (
    CartItemID INT AUTO_INCREMENT PRIMARY KEY,
    CartID INT NOT NULL,
    ProductID INT NOT NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (CartID) REFERENCES ShoppingCart(CartID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    UNIQUE INDEX idx_cart_product (CartID, ProductID)
);

-- Reviews table
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    ProductID INT NOT NULL,
    UserID INT NOT NULL,
    Rating INT NOT NULL CHECK (Rating BETWEEN 1 AND 5),
    Title VARCHAR(100),
    Comment TEXT,
    IsVerifiedPurchase BOOLEAN DEFAULT FALSE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_review_product (ProductID),
    INDEX idx_review_user (UserID),
    INDEX idx_review_rating (Rating)
);

-- Payments table
CREATE TABLE Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    Amount DECIMAL(10, 2) NOT NULL,
    PaymentMethod VARCHAR(50) NOT NULL,
    PaymentStatus ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    TransactionID VARCHAR(100),
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    INDEX idx_payment_order (OrderID),
    INDEX idx_payment_status (PaymentStatus)
);

-- Shipping table
CREATE TABLE Shippings (
    ShippingID INT AUTO_INCREMENT PRIMARY KEY,
    OrderID INT NOT NULL,
    ShippingAddress TEXT NOT NULL,
    ShippingDate DATETIME,
    DeliveryDate DATETIME,
    TrackingNumber VARCHAR(100),
    ShippingMethod VARCHAR(50),
    Status VARCHAR(50) DEFAULT 'Preparing',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (OrderID) REFERENCES Orders(OrderID) ON DELETE CASCADE,
    INDEX idx_shipping_order (OrderID),
    INDEX idx_shipping_status (Status)
);

-- Admins table
CREATE TABLE Admins (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    AdminName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NOT NULL,
    Role ENUM('SuperAdmin', 'Admin', 'Editor', 'Viewer') DEFAULT 'Viewer',
    LastLogin DATETIME,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_admin_email (Email)
);

-- Wishlist table
CREATE TABLE Wishlist (
    WishlistID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    ProductID INT NOT NULL,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID) ON DELETE CASCADE,
    UNIQUE INDEX idx_wishlist_user_product (UserID, ProductID)
);

-- Coupons table
CREATE TABLE Coupons (
    CouponID INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) NOT NULL UNIQUE,
    DiscountType ENUM('Percentage', 'Fixed') NOT NULL,
    DiscountValue DECIMAL(10, 2) NOT NULL,
    MinOrderAmount DECIMAL(10, 2),
    MaxUsage INT,
    CurrentUsage INT DEFAULT 0,
    StartDate DATETIME,
    EndDate DATETIME,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_coupon_code (Code),
    INDEX idx_coupon_active (IsActive)
);

-- Stored Procedures

-- Get User Orders with details
DELIMITER $$
CREATE PROCEDURE GetUserOrders(IN userID INT)
BEGIN
    SELECT o.OrderID, o.OrderDate, o.TotalAmount, o.OrderStatus,
           s.Status AS ShippingStatus, p.PaymentStatus,
           COUNT(od.OrderDetailID) AS ItemCount
    FROM Orders o
    LEFT JOIN Shippings s ON o.OrderID = s.OrderID
    LEFT JOIN Payments p ON o.OrderID = p.OrderID
    LEFT JOIN OrderDetails od ON o.OrderID = od.OrderID
    WHERE o.UserID = userID
    GROUP BY o.OrderID
    ORDER BY o.OrderDate DESC;
END $$
DELIMITER ;

-- Get Product Details with Categories and Reviews
DELIMITER $$
CREATE PROCEDURE GetProductDetails(IN productID INT)
BEGIN
    SELECT p.*,
           GROUP_CONCAT(DISTINCT c.CategoryName SEPARATOR ', ') AS Categories,
           AVG(r.Rating) AS AverageRating,
           COUNT(DISTINCT r.ReviewID) AS ReviewCount
    FROM Products p
    LEFT JOIN ProductCategories pc ON p.ProductID = pc.ProductID
    LEFT JOIN Categories c ON pc.CategoryID = c.CategoryID
    LEFT JOIN Reviews r ON p.ProductID = r.ProductID
    WHERE p.ProductID = productID
    GROUP BY p.ProductID;
END $$
DELIMITER ;

-- Triggers

-- Update stock after order is placed
DELIMITER $$
CREATE TRIGGER UpdateStockAfterOrder
AFTER INSERT ON OrderDetails
FOR EACH ROW
BEGIN
    UPDATE Products
    SET Stock = Stock - NEW.Quantity
    WHERE ProductID = NEW.ProductID;
END $$
DELIMITER ;

-- Update product UpdatedAt timestamp
DELIMITER $$
CREATE TRIGGER UpdateProductTimestamp
BEFORE UPDATE ON Products
FOR EACH ROW
BEGIN
    SET NEW.UpdatedAt = CURRENT_TIMESTAMP;
END $$
DELIMITER ;

-- Insert initial demo data

-- Categories
INSERT INTO Categories (CategoryName, Description) VALUES 
('Electronics', 'Electronic devices and accessories'),
('Clothing', 'Apparel for men, women, and children'),
('Books', 'Physical and digital books'),
('Home & Kitchen', 'Home appliances and kitchen accessories'),
('Sports & Outdoors', 'Sporting goods and outdoor equipment');

-- Products
INSERT INTO Products (ProductName, Description, Price, Stock, ImageURL) VALUES 
('Smartphone X', 'Latest smartphone with advanced features', 999.99, 50, '/images/products/smartphone.jpg'),
('Laptop Pro', 'Professional laptop for work and gaming', 1299.99, 30, '/images/products/laptop.jpg'),
('Cotton T-Shirt', 'Comfortable cotton t-shirt for everyday wear', 19.99, 100, '/images/products/tshirt.jpg'),
('Digital Marketing Book', 'Comprehensive guide to digital marketing', 29.99, 25, '/images/products/book.jpg'),
('Coffee Maker', 'Automatic coffee maker for home use', 79.99, 40, '/images/products/coffeemaker.jpg');

-- Connect Products to Categories
INSERT INTO ProductCategories (ProductID, CategoryID) VALUES 
(1, 1), -- Smartphone in Electronics
(2, 1), -- Laptop in Electronics
(3, 2), -- T-Shirt in Clothing
(4, 3), -- Book in Books
(5, 4); -- Coffee Maker in Home & Kitchen

-- Admin User
INSERT INTO Admins (AdminName, Email, PasswordHash, Role) VALUES 
('admin', 'admin@example.com', '$2a$10$8Ux0G5XDHXwgSYuFI9VJQeWXC3rDYlZI5n.6yKA4mNAzm3UvpRbky', 'SuperAdmin'); -- Password: admin123
