const { pool } = require('../config/database');

class CVSubmission {
    static async create(submissionData) {        const {
            full_name,
            profession,
            bio,
            profile_image,
            education,
            experience,
            skills,
            languages,
            portfolio_links,
            portfolio_files,
            testimonials,
            testimonial_files,
            email,
            phone,
            social_media,
            website_goals,
            domain_preference,
            email_hosting_preference,
            service_type,
            ip_address,
            user_agent
        } = submissionData;        const query = `
            INSERT INTO cv_submissions (
                full_name, profession, bio, profile_image, education, experience,
                skills, languages, portfolio_links, portfolio_files, testimonials,
                testimonial_files, email, phone, social_media, website_goals,
                domain_preference, email_hosting_preference, service_type, ip_address, user_agent
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21
            ) RETURNING id, submission_date
        `;        const values = [
            full_name,
            profession,
            bio || null,
            profile_image || null,
            education || null,
            experience || null,
            skills || null,
            languages || null,
            portfolio_links || null,
            portfolio_files || null,
            testimonials || null,
            testimonial_files || null,
            email,
            phone || null,
            social_media || null,
            website_goals || null,
            domain_preference || null,
            email_hosting_preference || null,
            service_type || 'full-package',
            ip_address || null,
            user_agent || null
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating CV submission:', error);
            throw error;
        }
    }

    static async findById(id) {
        const query = 'SELECT * FROM cv_submissions WHERE id = $1';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error finding CV submission by ID:', error);
            throw error;
        }
    }

    static async findByEmail(email) {
        const query = 'SELECT * FROM cv_submissions WHERE email = $1 ORDER BY submission_date DESC';
        
        try {
            const result = await pool.query(query, [email]);
            return result.rows;
        } catch (error) {
            console.error('Error finding CV submissions by email:', error);
            throw error;
        }
    }

    static async getAll(limit = 50, offset = 0) {
        const query = `
            SELECT * FROM cv_submissions 
            ORDER BY submission_date DESC 
            LIMIT $1 OFFSET $2
        `;
        
        try {
            const result = await pool.query(query, [limit, offset]);
            return result.rows;
        } catch (error) {
            console.error('Error getting all CV submissions:', error);
            throw error;
        }
    }

    static async getCount() {
        const query = 'SELECT COUNT(*) as total FROM cv_submissions';
        
        try {
            const result = await pool.query(query);
            return parseInt(result.rows[0].total);
        } catch (error) {
            console.error('Error getting CV submissions count:', error);
            throw error;
        }
    }

    static async deleteById(id) {
        const query = 'DELETE FROM cv_submissions WHERE id = $1 RETURNING *';
        
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            console.error('Error deleting CV submission:', error);
            throw error;
        }
    }
}

module.exports = CVSubmission;
