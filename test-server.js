const express = require('express');
const app = express();

// Test direct routes
app.get('/', (req, res) => {
    res.send('Direct route works!');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Health check works' });
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Visit: http://localhost:3001');
});
