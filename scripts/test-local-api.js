// Script to test local API endpoints
const http = require('http');

const LOCAL_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function testAPIs() {
  console.log('🧪 Тестирование локальных API эндпоинтов...');
  console.log('=' .repeat(50));
  
  try {
    // Test database health
    console.log('\n1. Проверка подключения к базе данных:');
    const healthResponse = await makeRequest('/api/health');
    console.log(`   Статус: ${healthResponse.status}`);
    console.log(`   Ответ:`, healthResponse.data);
    
    // Test database seeding
    console.log('\n2. Инициализация базы данных:');
    const seedResponse = await makeRequest('/api/seed');
    console.log(`   Статус: ${seedResponse.status}`);
    console.log(`   Ответ:`, seedResponse.data);
    
    // Test users API
    console.log('\n3. Проверка API пользователей:');
    const usersResponse = await makeRequest('/api/users');
    console.log(`   Статус: ${usersResponse.status}`);
    if (usersResponse.status === 200) {
      console.log(`   Найдено пользователей: ${usersResponse.data.length}`);
    } else {
      console.log(`   Ошибка:`, usersResponse.data);
    }
    
    // Test categories API
    console.log('\n4. Проверка API категорий:');
    const categoriesResponse = await makeRequest('/api/categories');
    console.log(`   Статус: ${categoriesResponse.status}`);
    if (categoriesResponse.status === 200) {
      console.log(`   Найдено категорий: ${categoriesResponse.data.length}`);
    } else {
      console.log(`   Ошибка:`, categoriesResponse.data);
    }
    
    // Test actions API
    console.log('\n5. Проверка API действий:');
    const actionsResponse = await makeRequest('/api/actions');
    console.log(`   Статус: ${actionsResponse.status}`);
    if (actionsResponse.status === 200) {
      console.log(`   Найдено действий: ${actionsResponse.data.length}`);
    } else {
      console.log(`   Ошибка:`, actionsResponse.data);
    }
    
    // Test stats API
    console.log('\n6. Проверка API статистики:');
    const statsResponse = await makeRequest('/api/stats');
    console.log(`   Статус: ${statsResponse.status}`);
    if (statsResponse.status === 200) {
      console.log(`   Пользователь: ${statsResponse.data.name || 'Неизвестно'}`);
      console.log(`   Уровень: ${statsResponse.data.level || 0}`);
      console.log(`   Очки: ${statsResponse.data.globalScore || 0}`);
    } else {
      console.log(`   Ошибка:`, statsResponse.data);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('✅ Тестирование завершено!');
    
  } catch (error) {
    console.error('❌ Ошибка при тестировании:', error.message);
  }
}

// Run the tests
testAPIs();