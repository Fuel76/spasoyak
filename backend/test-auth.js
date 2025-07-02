const fetch = require('node-fetch');

async function testAuth() {
  try {
    console.log('Пытаемся войти...');
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'i@ddurnov.ru',
        password: 'qazxsw21'
      })
    });

    const data = await response.text();
    console.log('HTTP Status:', response.status);
    console.log('Response:', data);

    if (response.ok && data) {
      const jsonData = JSON.parse(data);
      if (jsonData.token) {
        console.log('TOKEN:', jsonData.token);
        return jsonData.token;
      }
    }
  } catch (error) {
    console.error('Ошибка:', error.message);
  }
}

testAuth();
