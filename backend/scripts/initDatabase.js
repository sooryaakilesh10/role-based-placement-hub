
const pool = require('../config/database');

const createTables = async () => {
  try {
    console.log('🔄 Creating database tables...');

    // Users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('Admin', 'Manager', 'Officer')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Companies table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id SERIAL PRIMARY KEY,
        company_name VARCHAR(255) NOT NULL,
        company_address TEXT NOT NULL,
        drive VARCHAR(255) NOT NULL,
        type_of_drive VARCHAR(100) NOT NULL,
        follow_up VARCHAR(100) NOT NULL,
        is_contacted BOOLEAN DEFAULT FALSE,
        remarks TEXT,
        contact_details TEXT NOT NULL,
        hr1_details TEXT,
        hr2_details TEXT,
        package VARCHAR(100) NOT NULL,
        assigned_officer_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Pending updates table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pending_updates (
        id SERIAL PRIMARY KEY,
        company_id INTEGER REFERENCES companies(id) ON DELETE CASCADE,
        officer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        original_data JSONB NOT NULL,
        updated_data JSONB NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Insert default users
    const checkUsers = await pool.query('SELECT COUNT(*) FROM users');
    if (parseInt(checkUsers.rows[0].count) === 0) {
      console.log('🔄 Creating default users...');
      
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password', 10);

      await pool.query(`
        INSERT INTO users (name, email, password, role) VALUES
        ('John Admin', 'admin@placement.com', $1, 'Admin'),
        ('Sarah Manager', 'manager@placement.com', $1, 'Manager'),
        ('Mike Officer', 'officer@placement.com', $1, 'Officer')
      `, [hashedPassword]);
    }

    // Insert sample companies if none exist
    const checkCompanies = await pool.query('SELECT COUNT(*) FROM companies');
    if (parseInt(checkCompanies.rows[0].count) === 0) {
      console.log('🔄 Creating sample companies...');
      
      const officerResult = await pool.query('SELECT id FROM users WHERE role = $1 LIMIT 1', ['Officer']);
      const officerId = officerResult.rows[0]?.id || null;

      await pool.query(`
        INSERT INTO companies (
          company_name, company_address, drive, type_of_drive, follow_up,
          is_contacted, remarks, contact_details, hr1_details, hr2_details,
          package, assigned_officer_id
        ) VALUES
        (
          'TechCorp Inc.',
          '123 Tech Street, Silicon Valley, CA',
          'Campus Drive 2024',
          'On-Campus',
          'Weekly',
          true,
          'Interested in CS students',
          'hr@techcorp.com, +1-555-0123',
          'John Smith - Sr. HR Manager',
          'Sarah Johnson - Recruiter',
          '₹12 LPA',
          $1
        ),
        (
          'DataSoft Ltd.',
          '456 Data Avenue, Austin, TX',
          'Virtual Drive 2024',
          'Virtual',
          'Bi-weekly',
          false,
          'Looking for data science roles',
          'careers@datasoft.com, +1-555-0456',
          'Alex Chen - Head of Talent',
          'Maria Garcia - Campus Relations',
          '₹15 LPA',
          $1
        )
      `, [officerId]);
    }

    console.log('✅ Database tables created and sample data inserted successfully!');
    console.log('📧 Default login credentials:');
    console.log('   Admin: admin@placement.com / password');
    console.log('   Manager: manager@placement.com / password');
    console.log('   Officer: officer@placement.com / password');
    
  } catch (error) {
    console.error('❌ Error creating database tables:', error);
  } finally {
    process.exit();
  }
};

createTables();
