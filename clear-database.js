// Clear database script for fresh start
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function clearDatabase() {
    try {
        console.log('🗑️  Starting database cleanup...');
        
        // Clear all submissions
        const result = await pool.query('DELETE FROM cv_submissions');
        console.log(`✅ Deleted ${result.rowCount} submissions from database`);
        
        // Reset the auto-increment counter
        await pool.query('ALTER SEQUENCE cv_submissions_id_seq RESTART WITH 1');
        console.log('✅ Reset ID sequence to start from 1');
        
        // Verify the table is empty
        const countResult = await pool.query('SELECT COUNT(*) FROM cv_submissions');
        const count = parseInt(countResult.rows[0].count);
        
        if (count === 0) {
            console.log('✅ Database successfully cleared!');
            console.log('📊 Current submissions count: 0');
        } else {
            console.log(`❌ Warning: ${count} submissions still remain`);
        }
        
    } catch (error) {
        console.error('❌ Error clearing database:', error.message);
    } finally {
        await pool.end();
    }
}

// Run the cleanup
clearDatabase();
