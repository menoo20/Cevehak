const express = require('express');
const router = express.Router();

console.log('Creating router...', typeof router);

// Serve the main form page
router.get('/', (req, res) => {
    res.sendFile('index.html', { root: './views' });
});

// Serve admin dashboard
router.get('/admin', (req, res) => {
    res.sendFile('admin.html', { root: './views' });
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: 'testing'
    });
});

console.log('Router created, exporting...', typeof router);
module.exports = router;
