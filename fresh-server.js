const express = require('express');
const routes = require('./routes/fresh');

console.log('Main server: Imported routes type:', typeof routes);
console.log('Main server: Routes instanceof Function:', routes instanceof Function);

const app = express();

try {
    console.log('Main server: Attempting to use routes...');
    app.use('/', routes);
    console.log('Main server: Routes added successfully!');
    
    const PORT = 3002;
    app.listen(PORT, () => {
        console.log(`Fresh server running on port ${PORT}`);
        console.log('Visit: http://localhost:3002');
    });
} catch (error) {
    console.error('Main server: Error using routes:', error.message);
    console.error('Main server: Full error:', error);
}
