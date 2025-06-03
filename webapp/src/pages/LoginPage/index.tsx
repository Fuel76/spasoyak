import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/system-pages.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/admin'); // Перенаправляем на страницу админки после успешного входа
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ошибка входа в систему');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-auth-card">
          <h1 className="system-page-title">Вход в систему</h1>
          {error && <div className="system-error-message">{error}</div>}
          <form onSubmit={handleSubmit} className="system-auth-form">
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
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          <div className="system-auth-links">
            <a href="/register" className="system-link">Нет аккаунта? Зарегистрироваться</a>
          </div>
        </div>
      </div>
    </div>
  );
}