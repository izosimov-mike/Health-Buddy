// Script to seed the database after deployment
const https = require('https');

const VERCEL_URL = 'https://health-buddy-seven.vercel.app';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.setTimeout(30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');
  
  try {
    const response = await makeRequest(`${VERCEL_URL}/api/seed`);
    
    if (response.status === 200) {
      console.log('✅ Database seeded successfully!');
      console.log('Response:', response.data);
    } else {
      console.error('❌ Seeding failed with status:', response.status);
      console.error('Response:', response.data);
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
  }
}

// Run the seeding
seedDatabase();