import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminSettings.css';

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maxUploadSize: number;
  enableRegistration: boolean;
  enableComments: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  timeZone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: 'Православный монастырь',
    siteDescription: 'Официальный сайт православного монастыря',
    contactEmail: 'info@monastery.ru',
    contactPhone: '+7 (800) 123-45-67',
    address: 'Россия, Московская область',
    maxUploadSize: 10,
    enableRegistration: true,
    enableComments: true,
    maintenanceMode: false,
    emailNotifications: true,
    backupFrequency: 'daily',
    timeZone: 'Europe/Moscow',
    language: 'ru',
    theme: 'light'
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Функция для получения токена авторизации
  const getAuthToken = (): string | null => {
    const sessionData = localStorage.getItem('session');
    return sessionData ? JSON.parse(sessionData).token : null;
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings', {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        setMessage({ type: 'error', text: 'Ошибка загрузки настроек. Используются значения по умолчанию.' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      setMessage({ type: 'error', text: 'Ошибка подключения к серверу. Используются значения по умолчанию.' });
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleChange = (field: keyof SystemSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setMessage({ type: 'success', text: 'Настройки успешно сохранены!' });
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка сохранения настроек');
      }
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      setMessage({ type: 'error', text: `Ошибка при сохранении настроек: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="admin-settings-header">
        <div className="admin-settings-title">
          <h1>⚙️ Настройки системы</h1>
          <p>Конфигурация основных параметров сайта</p>
        </div>
        <div className="admin-settings-actions">
          <Link to="/admin" className="admin-btn admin-btn-outline">
            ← Назад в админку
          </Link>
          <button 
            className="admin-btn admin-btn-primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? '💾 Сохранение...' : '💾 Сохранить изменения'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="settings-grid">
        {/* Основная информация */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🏛️ Основная информация</h2>
            <p>Основные данные о монастыре</p>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Название сайта</label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => handleChange('siteName', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Описание сайта</label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => handleChange('siteDescription', e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>
            <div className="form-group">
              <label>Email для связи</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleChange('contactEmail', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Телефон</label>
              <input
                type="tel"
                value={settings.contactPhone}
                onChange={(e) => handleChange('contactPhone', e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Адрес</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => handleChange('address', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Технические настройки */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔧 Технические настройки</h2>
            <p>Параметры работы системы</p>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Максимальный размер загружаемых файлов (МБ)</label>
              <input
                type="number"
                value={settings.maxUploadSize}
                onChange={(e) => handleChange('maxUploadSize', Number(e.target.value))}
                className="form-input"
                min="1"
                max="100"
              />
            </div>
            <div className="form-group">
              <label>Часовой пояс</label>
              <select
                value={settings.timeZone}
                onChange={(e) => handleChange('timeZone', e.target.value)}
                className="form-select"
              >
                <option value="Europe/Moscow">Московское время (GMT+3)</option>
                <option value="Europe/Kiev">Киевское время (GMT+2)</option>
                <option value="Europe/Minsk">Минское время (GMT+3)</option>
                <option value="Asia/Yekaterinburg">Екатеринбургское время (GMT+5)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Язык интерфейса</label>
              <select
                value={settings.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="form-select"
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
                <option value="uk">Українська</option>
              </select>
            </div>
            <div className="form-group">
              <label>Тема оформления</label>
              <select
                value={settings.theme}
                onChange={(e) => handleChange('theme', e.target.value as 'light' | 'dark' | 'auto')}
                className="form-select"
              >
                <option value="light">Светлая</option>
                <option value="dark">Темная</option>
                <option value="auto">Автоматически</option>
              </select>
            </div>
          </div>
        </div>

        {/* Функциональность */}
        <div className="settings-section">
          <div className="section-header">
            <h2>⚡ Функциональность</h2>
            <p>Включение и отключение возможностей</p>
          </div>
          <div className="settings-form">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableRegistration}
                  onChange={(e) => handleChange('enableRegistration', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Разрешить регистрацию новых пользователей</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableComments}
                  onChange={(e) => handleChange('enableComments', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Включить комментарии к новостям</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Email уведомления</span>
              </label>
            </div>
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Режим технического обслуживания</span>
              </label>
              {settings.maintenanceMode && (
                <p className="checkbox-hint">⚠️ Сайт будет недоступен для посетителей</p>
              )}
            </div>
          </div>
        </div>

        {/* Резервное копирование */}
        <div className="settings-section">
          <div className="section-header">
            <h2>💾 Резервное копирование</h2>
            <p>Настройки автоматического бэкапа</p>
          </div>
          <div className="settings-form">
            <div className="form-group">
              <label>Частота создания резервных копий</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => handleChange('backupFrequency', e.target.value as 'daily' | 'weekly' | 'monthly')}
                className="form-select"
              >
                <option value="daily">Ежедневно</option>
                <option value="weekly">Еженедельно</option>
                <option value="monthly">Ежемесячно</option>
              </select>
            </div>
            <div className="backup-actions">
              <button className="backup-btn">📥 Создать резервную копию</button>
              <button className="backup-btn">📤 Восстановить из копии</button>
            </div>
          </div>
        </div>

        {/* Информация о системе */}
        <div className="settings-section">
          <div className="section-header">
            <h2>ℹ️ Информация о системе</h2>
            <p>Технические данные</p>
          </div>
          <div className="system-info">
            <div className="info-item">
              <span className="info-label">Версия системы:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Последнее обновление:</span>
              <span className="info-value">15.01.2024</span>
            </div>
            <div className="info-item">
              <span className="info-label">Размер базы данных:</span>
              <span className="info-value">24.5 МБ</span>
            </div>
            <div className="info-item">
              <span className="info-label">Дисковое пространство:</span>
              <span className="info-value">1.2 ГБ / 10 ГБ</span>
            </div>
          </div>
        </div>

        {/* Опасная зона */}
        <div className="settings-section danger-section">
          <div className="section-header">
            <h2>⚠️ Опасная зона</h2>
            <p>Критические операции</p>
          </div>
          <div className="danger-actions">
            <button className="danger-btn">🗑️ Очистить кэш</button>
            <button className="danger-btn">📊 Сброс статистики</button>
            <button className="danger-btn">⚠️ Сброс к заводским настройкам</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;
