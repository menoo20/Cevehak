const { pool } = require('./config/database');

async function addServiceTypeColumn() {
    try {
        console.log('🔧 Adding service_type column to cv_submissions table...');
        
        // Add service_type column if it doesn't exist
        await pool.query(`
            ALTER TABLE cv_submissions 
            ADD COLUMN IF NOT EXISTS service_type VARCHAR(50) DEFAULT 'full-package'
        `);
        
        console.log('✅ service_type column added successfully');
        
        // Update existing records to have proper service types
        // We'll make educated guesses based on available data
        console.log('📝 Updating existing records with service types...');
          // Records with portfolio files are likely cv-to-website submissions
        await pool.query(`
            UPDATE cv_submissions 
            SET service_type = 'cv-to-website' 
            WHERE (portfolio_files IS NOT NULL AND portfolio_files != '') 
            AND service_type = 'full-package'
        `);
        
        // Records with only basic info and no files are likely cv-only
        await pool.query(`
            UPDATE cv_submissions 
            SET service_type = 'cv-only' 
            WHERE (profile_image IS NULL OR profile_image = '') 
            AND (portfolio_files IS NULL OR portfolio_files = '')
            AND (testimonial_files IS NULL OR testimonial_files = '')
            AND service_type = 'full-package'
        `);
        
        console.log('✅ Existing records updated with appropriate service types');
        
        // Show final statistics
        const stats = await pool.query(`
            SELECT service_type, COUNT(*) as count 
            FROM cv_submissions 
            GROUP BY service_type 
            ORDER BY service_type
        `);
        
        console.log('📊 Current service type distribution:');
        stats.rows.forEach(row => {
            console.log(`   ${row.service_type}: ${row.count} submissions`);
        });
        
        console.log('🎉 Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Error adding service_type column:', error);
        throw error;
    } finally {
        await pool.end();
    }
}

// Run the migration
addServiceTypeColumn().catch(console.error);
