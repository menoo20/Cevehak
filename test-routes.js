const express = require('express');
const router = express.Router();

// Simple test route
router.get('/', (req, res) => {
    res.send('Test route working');
});

router.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Test health check working' });
});

console.log('Test router created, type:', typeof router);
module.exports = router;
