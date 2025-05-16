// Create test admin script
const db = require('./src/config/database');
const bcrypt = require('bcryptjs');

async function createTestAdmin() {
  try {
    // Check if admin already exists
    const [existingAdmin] = await db.query('SELECT * FROM Admins WHERE Email = ?', ['testadmin@example.com']);
    
    if (existingAdmin.length > 0) {
      console.log('Test admin already exists!');
      return;
    }
    
    // Create hashed password
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Insert new admin
    const [result] = await db.query(
      'INSERT INTO Admins (AdminName, Email, PasswordHash, Role, IsActive) VALUES (?, ?, ?, ?, ?)',
      ['Test Admin', 'testadmin@example.com', hashedPassword, 'Admin', true]
    );
    
    console.log('Test admin created successfully with ID:', result.insertId);
    console.log('Login credentials:');
    console.log('Email: testadmin@example.com');
    console.log('Password: test123');
  } catch (error) {
    console.error('Error creating test admin:', error);
  } finally {
    process.exit(0);
  }
}

createTestAdmin();
