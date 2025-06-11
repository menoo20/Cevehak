const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

// Create tables if they don't exist
const createTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS cv_submissions (
                id SERIAL PRIMARY KEY,
                full_name VARCHAR(255) NOT NULL,
                profession VARCHAR(255) NOT NULL,
                bio TEXT,
                profile_image VARCHAR(500),
                education TEXT,
                experience TEXT,
                skills TEXT,
                languages VARCHAR(500),
                portfolio_links TEXT,
                portfolio_files TEXT,
                testimonials TEXT,
                testimonial_files TEXT,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                social_media TEXT,
                website_goals TEXT[],
                domain_preference VARCHAR(50),
                email_hosting_preference VARCHAR(50),
                submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_address INET,
                user_agent TEXT
            )
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_cv_submissions_email ON cv_submissions(email);
        `);
        
        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_cv_submissions_date ON cv_submissions(submission_date);
        `);
        
        console.log('Database tables created successfully');
    } catch (error) {
        console.error('Error creating tables:', error);
    }
};

// Test database connection
const testConnection = async () => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('✅ Database connection successful!');
        console.log('Current time:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        return false;
    }
};

module.exports = {
    pool,
    createTables,
    testConnection
};
