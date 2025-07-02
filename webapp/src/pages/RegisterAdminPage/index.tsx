import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerAdmin } from '../../lib/auth';
import '../../styles/system-pages.css';

export function RegisterAdminPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [adminKey, setAdminKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await registerAdmin(email, password, name, adminKey);
      setSuccess('Администратор успешно зарегистрирован!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации администратора');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-auth-card">
          <h1 className="system-page-title">Регистрация администратора</h1>
          {error && <div className="system-error-message">{error}</div>}
          {success && <div className="system-success-message">{success}</div>}
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
            <div className="system-form-group">
              <input
                type="text"
                placeholder="Секретный ключ администратора"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                required
                disabled={loading}
                className="system-input"
              />
            </div>
            <button type="submit" disabled={loading} className="system-btn system-btn-primary">
              {loading ? 'Регистрация...' : 'Зарегистрировать администратора'}
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
