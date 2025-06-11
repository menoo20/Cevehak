const { Pool } = require('pg');
require('dotenv').config();

// Database setup script
async function setupDatabase() {
    console.log('🔧 Setting up database...');
    
    try {
        // Connect without database to create it
        const adminPool = new Pool({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'postgres' // Connect to default postgres database
        });

        // Check if database exists
        const dbCheck = await adminPool.query(
            "SELECT 1 FROM pg_database WHERE datname = $1",
            [process.env.DB_NAME]
        );

        if (dbCheck.rows.length === 0) {
            // Create database
            await adminPool.query(`CREATE DATABASE "${process.env.DB_NAME}"`);
            console.log(`✅ Database "${process.env.DB_NAME}" created successfully`);
        } else {
            console.log(`📄 Database "${process.env.DB_NAME}" already exists`);
        }

        await adminPool.end();

        // Now connect to our database and create tables
        const { createTables } = require('./config/database');
        await createTables();
        
        console.log('🎉 Database setup completed successfully!');
        console.log('📊 You can now run: npm run dev');
        
    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        console.log('\n💡 Make sure PostgreSQL is running and your .env file is configured correctly');
        console.log('💡 Example .env configuration:');
        console.log('   DB_HOST=localhost');
        console.log('   DB_PORT=5432');
        console.log('   DB_NAME=cv_website_service');
        console.log('   DB_USER=postgres');
        console.log('   DB_PASSWORD=your_password');
    }
    
    process.exit(0);
}

setupDatabase();
