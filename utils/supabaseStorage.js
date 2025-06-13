// Supabase Storage Integration for Large Files
const { createClient } = require('@supabase/supabase-js');

class SupabaseFileHandler {
    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
    }

    async uploadFile(file, submissionId, fileType) {
        try {
            const fileName = `${submissionId}/${fileType}_${Date.now()}_${file.originalname}`;
            
            const { data, error } = await this.supabase.storage
                .from('cv-submissions')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (error) throw error;

            // Get public URL
            const { data: urlData } = this.supabase.storage
                .from('cv-submissions')
                .getPublicUrl(fileName);

            return {
                success: true,
                fileName: fileName,
                publicUrl: urlData.publicUrl,
                size: file.size
            };

        } catch (error) {
            console.error('Supabase upload error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async uploadMultipleFiles(files, submissionId) {
        const results = [];
        
        for (const [fieldName, fileArray] of Object.entries(files)) {
            for (const file of fileArray) {
                const result = await this.uploadFile(file, submissionId, fieldName);
                results.push({
                    fieldName,
                    originalName: file.originalname,
                    ...result
                });
            }
        }

        return results;
    }
}

module.exports = SupabaseFileHandler;
