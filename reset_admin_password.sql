-- Reset admin password to "newadmin123"
-- This uses a new bcrypt hash for the password "newadmin123"
USE ecommerceapp;

UPDATE Admins 
SET PasswordHash = '$2a$10$KG3XMYlxAJRnNyVb0qHXpup8DJzaRdTKzLxqoEWPzXUCUYB3fXlxK' 
WHERE Email = 'admin@example.com';

-- Show updated admin record
SELECT AdminID, AdminName, Email, Role FROM Admins WHERE Email = 'admin@example.com';
