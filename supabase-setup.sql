-- Supabase Database Setup for Cevehak CV Website Service
-- Run this SQL in Supabase SQL Editor

-- Create main cv_submissions table
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
    user_agent TEXT,
    service_type VARCHAR(50) DEFAULT 'full-package',
    cv_file VARCHAR(500),
    additional_files TEXT
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cv_submissions_email ON cv_submissions(email);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_date ON cv_submissions(submission_date);
CREATE INDEX IF NOT EXISTS idx_cv_submissions_service_type ON cv_submissions(service_type);

-- Enable Row Level Security (RLS) for security
ALTER TABLE cv_submissions ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows all operations (you can restrict this later)
CREATE POLICY "Allow all operations on cv_submissions" ON cv_submissions
    FOR ALL USING (true) WITH CHECK (true);

-- Grant necessary permissions
GRANT ALL ON TABLE cv_submissions TO postgres;
GRANT ALL ON SEQUENCE cv_submissions_id_seq TO postgres;
