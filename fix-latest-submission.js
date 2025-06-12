const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

async function fixLatestSubmission() {
    try {
        console.log('🔧 Fixing latest submission issues...');

        // Get the latest submission
        const result = await pool.query('SELECT * FROM cv_submissions ORDER BY id DESC LIMIT 1');
        
        if (result.rows.length === 0) {
            console.log('No submissions found');
            return;
        }

        const submission = result.rows[0];
        console.log(`\n👤 Fixing submission: ${submission.full_name} (ID: ${submission.id})`);
        
        // Fix profile image path
        const correctProfileImage = 'Mohammed_amin/freepik__create-a-sketch-for-a-boy-who-is-getting-_1749712791673-537945271.png';
        
        // Fix portfolio files path
        const correctPortfolioFiles = 'Mohammed_amin_1/freepik__a-highly-detailed-cinematic-3d-render-of-_1749712791682-57127967.png';
        
        // Fix service type (assuming it should be cv-only based on user's mention)
        const correctServiceType = 'cv-only';

        // Update the database
        await pool.query(`
            UPDATE cv_submissions 
            SET 
                profile_image = $1,
                portfolio_files = $2,
                service_type = $3
            WHERE id = $4
        `, [correctProfileImage, correctPortfolioFiles, correctServiceType, submission.id]);

        console.log('✅ Fixed issues:');
        console.log(`   📸 Profile image: ${correctProfileImage}`);
        console.log(`   📁 Portfolio files: ${correctPortfolioFiles}`);
        console.log(`   🏷️ Service type: ${correctServiceType}`);

        // Verify the fix
        const verifyResult = await pool.query('SELECT * FROM cv_submissions WHERE id = $1', [submission.id]);
        const fixed = verifyResult.rows[0];
        
        console.log('\n✅ Verification:');
        console.log(`   Service Type: ${fixed.service_type}`);
        console.log(`   Profile Image: ${fixed.profile_image}`);
        console.log(`   Portfolio Files: ${fixed.portfolio_files}`);
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await pool.end();
    }
}

fixLatestSubmission();
