import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './AdminPagesPage.css';

interface Page {
  id: number;
  title: string;
  slug: string;
  isVisible: boolean;
  updatedAt: string;
  createdAt: string;
}

export const AdminPagesPage: React.FC = () => {
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/pages`);
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      const data = await response.json();
      setPages(Array.isArray(data) ? data : data.pages || []);
      setLoading(false);
    } catch (err) {
      console.error('Ошибка при загрузке страниц:', err);
      setError(err instanceof Error ? err.message : 'Неизвестная ошибка');
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту страницу?')) {
      return;
    }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(`${API_URL}/api/pages/${id}`, {
        method: 'DELETE',
        headers,
      });
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      showNotification('Страница удалена');
      fetchPages();
    } catch (err) {
      console.error('Ошибка при удалении страницы:', err);
      alert(`Ошибка при удалении: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  const handleToggleVisibility = async (page: Page) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      // Получаем актуальные данные страницы перед изменением видимости
      const pageRes = await fetch(`${API_URL}/api/pages/${page.id}`);
      if (!pageRes.ok) {
        alert('Ошибка: страница не найдена или сервер вернул ошибку.');
        return;
      }
      const pageData = await pageRes.json();
      // Обновляем только поле isVisible, остальные данные не теряются
      const response = await fetch(`${API_URL}/api/pages/${page.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          ...pageData,
          isVisible: !page.isVisible
        }),
      });
      if (!response.ok) {
        throw new Error(`Ошибка: ${response.status}`);
      }
      showNotification(page.isVisible ? 'Страница скрыта' : 'Страница опубликована');
      fetchPages();
    } catch (err) {
      console.error('Ошибка при изменении видимости:', err);
      alert(`Ошибка при изменении видимости: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(search.toLowerCase()) ||
    page.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Загрузка списка страниц...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-pages">
      <div className="admin-pages__header">
        <h1>Управление страницами</h1>
        <button 
          className="admin-pages__create-btn" 
          onClick={() => navigate('/admin/pages/create')}
        >
          + Создать новую страницу
        </button>
        <input
          type="text"
          placeholder="Поиск по заголовку или slug..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="admin-pages__search"
          style={{ marginLeft: 16, minWidth: 220 }}
        />
      </div>
      {notification && (
        <div className="admin-pages__notification">{notification}</div>
      )}
      {filteredPages.length === 0 ? (
        <div className="admin-pages__empty">
          <p>Страницы не найдены. Создайте первую страницу!</p>
        </div>
      ) : (
        <div className="admin-pages__table-container">
          <table className="admin-pages__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Заголовок</th>
                <th>Slug (URL)</th>
                <th>Видимость</th>
                <th>Последнее обновление</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredPages.map((page) => (
                <tr key={page.id} className={!page.isVisible ? 'row-inactive' : ''}>
                  <td>{page.id}</td>
                  <td>{page.title}</td>
                  <td>
                    <a 
                      href={`/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer" 
                      title="Открыть страницу"
                    >
                      {page.slug}
                    </a>
                  </td>
                  <td>
                    <button 
                      className={`visibility-toggle ${page.isVisible ? 'visible' : 'hidden'}`}
                      onClick={() => handleToggleVisibility(page)}
                      title={page.isVisible ? "Скрыть страницу" : "Показать страницу"}
                    >
                      {page.isVisible ? "Видимая" : "Скрытая"}
                    </button>
                  </td>
                  <td>{formatDate(page.updatedAt)}</td>
                  <td>
                    <div className="admin-pages__actions">
                      <Link 
                        to={`/admin/pages/edit/${page.id}`}
                        className="action-btn edit"
                        title="Редактировать"
                      >
                        ✏️
                      </Link>
                      <button
                        className="action-btn delete"
                        onClick={() => handleDelete(page.id)}
                        title="Удалить"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};