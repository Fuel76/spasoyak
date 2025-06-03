import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/system-pages.css';

export function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Ошибка регистрации');
      }
      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-auth-card">
          <h1 className="system-page-title">Регистрация</h1>
          {error && <div className="system-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="system-auth-form">
            <div className="system-form-group">
              <input
                type="text"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
                className="system-input"
              />
            </div>
            <div className="system-form-group">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="system-input"
              />
            </div>
            <div className="system-form-group">
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="system-input"
              />
            </div>
            <button type="submit" disabled={loading} className="system-btn system-btn-primary">
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          <div className="system-auth-links">
            <a href="/login" className="system-link">Уже есть аккаунт? Войти</a>
          </div>
        </div>
      </div>
    </div>
  );
}
