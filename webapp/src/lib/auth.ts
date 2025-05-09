export async function signIn(email: string, password: string) {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Ошибка входа. Проверьте учетные данные.');
  }

  const data = await response.json();
  localStorage.setItem('session', JSON.stringify({ token: data.token }));
  return data;
}

export async function signOut() {
  localStorage.removeItem('session');
}

export async function getUser(token: string) {
  const response = await fetch('http://localhost:3000/api/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Не удалось получить данные пользователя.');
  }

  return response.json();
}

export async function registerAdmin(email: string, password: string, name: string, adminKey: string) {
  const response = await fetch('http://localhost:3000/api/auth/register-admin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password, name, adminKey }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка регистрации администратора');
  }
  return data;
}