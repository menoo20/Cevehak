const fs = require('fs');
const path = require('path');

function checkUploadsFolder() {
    console.log('📊 Current uploads folder status:');
    
    const uploadsPath = path.join(__dirname, 'public', 'uploads');
    
    try {
        const items = fs.readdirSync(uploadsPath, { withFileTypes: true });
        
        let totalFiles = 0;
        let totalFolders = 0;
        
        console.log('\n📂 Items in uploads folder:');
        
        for (const item of items) {
            if (item.name === '.gitkeep') {
                console.log(`📁 ${item.name} (preserved)`);
                continue;
            }
            
            if (item.isDirectory()) {
                const itemPath = path.join(uploadsPath, item.name);
                try {
                    const folderContents = fs.readdirSync(itemPath);
                    totalFiles += folderContents.length;
                    console.log(`📁 ${item.name}/ (${folderContents.length} files)`);
                } catch (err) {
                    console.log(`📁 ${item.name}/ (unable to read)`);
                }
                totalFolders++;
            } else {
                console.log(`📄 ${item.name}`);
                totalFiles++;
            }
        }
        
        console.log('\n📋 Summary:');
        console.log(`   📁 User folders: ${totalFolders}`);
        console.log(`   📄 Total files: ${totalFiles}`);
        console.log(`   🎯 Items to be cleaned: ${totalFolders + (totalFiles > 0 ? 1 : 0)}`);
        
    } catch (error) {
        console.error('❌ Error reading uploads folder:', error);
    }
}

checkUploadsFolder();
