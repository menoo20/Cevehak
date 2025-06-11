const express = require('express');
const router = express.Router();

console.log('Routes file: Creating router...');
console.log('Router type:', typeof router);

// Simple test route
router.get('/', (req, res) => {
    res.send('Hello from routes!');
});

router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Health check working!',
        timestamp: new Date().toISOString()
    });
});

console.log('Routes file: About to export router');
console.log('Exporting router type:', typeof router);

module.exports = router;
