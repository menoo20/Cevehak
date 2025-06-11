console.log('=== ROUTER DEBUG ===');

const express = require('express');
console.log('1. Express loaded');

const router = express.Router();
console.log('2. Router created:', typeof router);
console.log('3. Router properties:', Object.getOwnPropertyNames(router));

// Test adding a route
try {
    router.get('/test', (req, res) => {
        res.send('test');
    });
    console.log('4. Route added successfully');
} catch (err) {
    console.log('4. Error adding route:', err.message);
}

console.log('5. About to export router');
module.exports = router;
console.log('6. Router exported');
