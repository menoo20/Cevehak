const http = require('http');

function testImageAccess(imagePath) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: imagePath,
      method: 'GET'
    };

    console.log(`🔍 Testing: ${imagePath}`);
    
    const req = http.request(options, (res) => {
      console.log(`   ✅ Status: ${res.statusCode} ${res.statusMessage}`);
      console.log(`   📄 Content-Type: ${res.headers['content-type']}`);
      console.log(`   📏 Content-Length: ${res.headers['content-length']}`);
      
      if (res.statusCode === 200) {
        console.log(`   🎉 SUCCESS: Image is accessible!`);
      } else {
        console.log(`   ❌ ERROR: Image returned status ${res.statusCode}`);
      }
      
      resolve(res.statusCode);
    });

    req.on('error', (e) => {
      console.error(`   ❌ Network Error: ${e.message}`);
      resolve(0);
    });

    req.setTimeout(5000, () => {
      console.log(`   ⏰ Request timeout`);
      req.destroy();
      resolve(0);
    });

    req.end();
  });
}

async function testAllImages() {
  console.log('🧪 Final Image Accessibility Test');
  console.log('=================================');
  console.log('Testing images after our fixes...\n');
  
  const imagePaths = [
    '/uploads/Mohammed_amin/freepik__a-highly-detailed-cinematic-3d-render-of-_1749715607550-19344072.png',
    '/uploads/Mohammed_amin/freepik__create-a-sketch-for-a-boy-who-is-getting-_1749715607555-410248137.png'
  ];
  
  let allSuccess = true;
  
  for (const path of imagePaths) {
    const status = await testImageAccess(path);
    if (status !== 200) {
      allSuccess = false;
    }
    console.log('');
  }
  
  console.log('📊 Test Results Summary:');
  console.log('========================');
  if (allSuccess) {
    console.log('🎉 ALL IMAGES ACCESSIBLE - 404 ERROR FIXED!');
    console.log('✅ Single folder structure working correctly');
    console.log('✅ File paths resolved properly');
    console.log('✅ Static file serving working');
  } else {
    console.log('❌ Some images still have issues');
    console.log('🔧 Further debugging may be needed');
  }
}

testAllImages().catch(console.error);
