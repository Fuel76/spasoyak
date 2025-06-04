import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AdminPage.css';
import CarouselManager from './CarouselManager';

interface StatsData {
  totalPages: number;
  totalNews: number;
  totalCategories: number;
  totalTags: number;
  pendingTreby: number;
  totalTreby: number;
}

const AdminPage = () => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // В реальном приложении здесь бы был API для получения статистики
      const mockStats: StatsData = {
        totalPages: 15,
        totalNews: 42,
        totalCategories: 8,
        totalTags: 23,
        pendingTreby: 7,
        totalTreby: 156
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-content">
          <h1 className="admin-title">Административная панель</h1>
          <p className="admin-subtitle">Управление сайтом монастыря</p>
        </div>
        <div className="admin-header-actions">
          <Link to="/" className="admin-btn admin-btn-outline">
            🏠 На главную
          </Link>
          <button className="admin-btn admin-btn-primary">
            ⚙️ Настройки
          </button>
        </div>
      </div>

      {/* Статистика */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.totalPages}</div>
            <div className="stat-label">Страниц</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📰</div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.totalNews}</div>
            <div className="stat-label">Новостей</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.pendingTreby}</div>
            <div className="stat-label">Заявок на рассмотрении</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏷️</div>
          <div className="stat-content">
            <div className="stat-number">{loading ? '...' : stats?.totalTags}</div>
            <div className="stat-label">Тегов</div>
          </div>
        </div>
      </div>

      {/* Основные разделы */}
      <div className="admin-grid">
        {/* Контент */}
        <div className="admin-section content-section">
          <div className="section-header">
            <h2>📝 Управление контентом</h2>
            <p>Создание и редактирование материалов</p>
          </div>
          <div className="section-links">
            <Link to="/admin/pages" className="admin-link">
              <span className="link-icon">📄</span>
              <span className="link-text">Страницы сайта</span>
              <span className="link-badge">{stats?.totalPages || 0}</span>
            </Link>
            <Link to="/admin/pages/create" className="admin-link">
              <span className="link-icon">➕</span>
              <span className="link-text">Создать страницу</span>
            </Link>
            <Link to="/admin/news" className="admin-link">
              <span className="link-icon">📰</span>
              <span className="link-text">Новости</span>
              <span className="link-badge">{stats?.totalNews || 0}</span>
            </Link>
            <Link to="/news/add" className="admin-link">
              <span className="link-icon">📝</span>
              <span className="link-text">Добавить новость</span>
            </Link>
          </div>
        </div>

        {/* Православный календарь */}
        <div className="admin-section calendar-section">
          <div className="section-header">
            <h2>📅 Православный календарь</h2>
            <p>Святцы, богослужения и чтения</p>
          </div>
          <div className="section-links">
            <Link to="/admin/calendar" className="admin-link">
              <span className="link-icon">📅</span>
              <span className="link-text">Календарь</span>
            </Link>
            <Link to="/admin/calendar/saints" className="admin-link">
              <span className="link-icon">✨</span>
              <span className="link-text">Святцы</span>
            </Link>
            <Link to="/admin/calendar/readings" className="admin-link">
              <span className="link-icon">📖</span>
              <span className="link-text">Чтения</span>
            </Link>
            <Link to="/admin/schedule" className="admin-link">
              <span className="link-icon">⛪</span>
              <span className="link-text">Расписание служб</span>
            </Link>
          </div>
        </div>

        {/* Заявки и требы */}
        <div className="admin-section treby-section">
          <div className="section-header">
            <h2>📋 Заявки на требы</h2>
            <p>Обработка церковных треб</p>
          </div>
          <div className="section-links">
            <Link to="/admin/treby" className="admin-link">
              <span className="link-icon">📋</span>
              <span className="link-text">Все заявки</span>
              <span className="link-badge warning">{stats?.pendingTreby || 0}</span>
            </Link>
            <Link to="/admin/treby/form-fields" className="admin-link">
              <span className="link-icon">🔧</span>
              <span className="link-text">Настройка полей</span>
            </Link>
            <Link to="/admin/treby/pricing-rules" className="admin-link">
              <span className="link-icon">💰</span>
              <span className="link-text">Правила ценообразования</span>
            </Link>
          </div>
        </div>

        {/* Структура сайта */}
        <div className="admin-section structure-section">
          <div className="section-header">
            <h2>🏗️ Структура сайта</h2>
            <p>Навигация и организация</p>
          </div>
          <div className="section-links">
            <Link to="/admin/sitemap" className="admin-link">
              <span className="link-icon">🗺️</span>
              <span className="link-text">Карта сайта</span>
            </Link>
            <Link to="/admin/categories" className="admin-link">
              <span className="link-icon">📂</span>
              <span className="link-text">Категории</span>
              <span className="link-badge">{stats?.totalCategories || 0}</span>
            </Link>
            <Link to="/admin/tags" className="admin-link">
              <span className="link-icon">🏷️</span>
              <span className="link-text">Теги</span>
              <span className="link-badge">{stats?.totalTags || 0}</span>
            </Link>
          </div>
        </div>

        {/* Мультимедиа */}
        <div className="admin-section media-section">
          <div className="section-header">
            <h2>🖼️ Мультимедиа</h2>
            <p>Изображения и файлы</p>
          </div>
          <div className="section-links">
            <Link to="/admin/media" className="admin-link">
              <span className="link-icon">🖼️</span>
              <span className="link-text">Медиа библиотека</span>
            </Link>
            <Link to="/admin/upload" className="admin-link">
              <span className="link-icon">⬆️</span>
              <span className="link-text">Загрузить файлы</span>
            </Link>
          </div>
        </div>

        {/* Настройки */}
        <div className="admin-section settings-section">
          <div className="section-header">
            <h2>⚙️ Настройки</h2>
            <p>Конфигурация системы</p>
          </div>
          <div className="section-links">
            <Link to="/admin/users" className="admin-link">
              <span className="link-icon">👥</span>
              <span className="link-text">Пользователи</span>
            </Link>
            <Link to="/admin/settings" className="admin-link">
              <span className="link-icon">⚙️</span>
              <span className="link-text">Общие настройки</span>
            </Link>
            <Link to="/admin/backups" className="admin-link">
              <span className="link-icon">💾</span>
              <span className="link-text">Резервные копии</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Карусель */}
      <div className="admin-section carousel-section">
        <div className="section-header">
          <h2>🖼️ Управление каруселью</h2>
          <p>Изображения на главной странице</p>
        </div>
        <CarouselManager />
      </div>
    </div>
  );
};

export default AdminPage;