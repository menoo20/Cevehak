const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const baseURL = 'http://localhost:3000';

// Helper function to create form data
const createTestSubmission = (serviceType) => {
    const form = new FormData();
    
    // Common fields for all services
    form.append('service_type', serviceType);
    form.append('full_name', 'Mohammed Test');
    form.append('email', 'test@example.com');
    
    // Service-specific fields
    switch(serviceType) {
        case 'cv-to-website':
            form.append('phone', '0501234567');
            // Create a simple test PDF file for CV upload
            const testPdfContent = '%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n197\n%%EOF';
            form.append('cv_file', Buffer.from(testPdfContent), {
                filename: 'test-cv.pdf',
                contentType: 'application/pdf'
            });
            break;
            
        case 'full-package':
            form.append('profession', 'مطور ويب');
            form.append('bio', 'مطور ويب متخصص في تطوير المواقع الحديثة');
            break;
            
        case 'cv-only':
            form.append('profession', 'مصمم جرافيك');
            form.append('bio', 'مصمم جرافيك مبدع ومتميز');
            break;
    }
    
    return form;
};

// Test function for each service
const testService = async (serviceType) => {
    console.log(`\n🧪 Testing ${serviceType} service...`);
    
    try {
        const form = createTestSubmission(serviceType);
        
        const response = await axios.post(`${baseURL}/submit`, form, {
            headers: {
                ...form.getHeaders(),
            },
        });
        
        console.log(`✅ ${serviceType} test PASSED:`);
        console.log(`   - Status: ${response.status}`);
        console.log(`   - Message: ${response.data.message}`);
        console.log(`   - Service Type: ${response.data.service_type}`);
        console.log(`   - Price: ${response.data.price} SAR`);
        
        return true;
    } catch (error) {
        console.log(`❌ ${serviceType} test FAILED:`);
        if (error.response) {
            console.log(`   - Status: ${error.response.status}`);
            console.log(`   - Error: ${error.response.data.message}`);
            if (error.response.data.errors) {
                console.log(`   - Errors: ${error.response.data.errors.join(', ')}`);
            }
        } else {
            console.log(`   - Error: ${error.message}`);
        }
        return false;
    }
};

// Main test function
const runAllTests = async () => {
    console.log('🚀 Starting Flexible CV Service Tests\n');
    
    // Test server health first
    try {
        const healthResponse = await axios.get(`${baseURL}/health`);
        console.log('✅ Server Health Check:', healthResponse.data.message);
        console.log('📊 Available Services:', healthResponse.data.services);
    } catch (error) {
        console.log('❌ Server Health Check Failed');
        return;
    }
    
    // Test all three services
    const services = ['cv-to-website', 'full-package', 'cv-only'];
    const results = [];
    
    for (const service of services) {
        const result = await testService(service);
        results.push({ service, passed: result });
    }
    
    // Summary
    console.log('\n📊 TEST SUMMARY:');
    console.log('================');
    
    const passed = results.filter(r => r.passed).length;
    const total = results.length;
    
    results.forEach(result => {
        const status = result.passed ? '✅ PASS' : '❌ FAIL';
        console.log(`${status} - ${result.service}`);
    });
    
    console.log(`\n🎯 Results: ${passed}/${total} tests passed`);
    
    if (passed === total) {
        console.log('🎉 All services are working correctly!');
    } else {
        console.log('⚠️  Some services need attention.');
    }
};

// Run tests
runAllTests().catch(console.error);
