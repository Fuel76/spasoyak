import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
// Удаляем импорт старых стилей
// import './AdminNewsList.css';

// Обновляем интерфейс
interface News {
  id: number;
  title: string;
  htmlContent: string;
  media: string[] | string;
  createdAt: string;
  cover?: string;
  isVisible: boolean;
  customCss?: string | null;
}

export const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); // Хук для навигации

  const fetchNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/news');
      if (!response.ok) throw new Error('Ошибка сети');
      const data = await response.json();
      // Исправление здесь:
      const newsArray = Array.isArray(data) ? data : data.news;
      setNews(newsArray.sort((a: News, b: News) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (error) {
      console.error('Ошибка при загрузке новостей:', error);
      setError('Не удалось загрузить новости.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleEdit = (id: number) => {
    navigate(`/admin/news/edit/${id}`); // Переход на страницу редактирования
  };

  const handleToggleVisibility = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3000/api/news/${id}/toggle-visibility`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Ошибка при изменении видимости');
      const updatedNewsItem = await response.json();
      // Обновляем состояние локально
      setNews(prevNews =>
        prevNews.map(item =>
          item.id === id ? { ...item, isVisible: updatedNewsItem.isVisible } : item
        )
      );
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось изменить видимость новости.');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту новость?')) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/api/news/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
         if (response.status === 404) throw new Error('Новость не найдена на сервере');
         throw new Error('Ошибка при удалении');
      }
      // Удаляем новость из локального состояния
      setNews(prevNews => prevNews.filter(item => item.id !== id));
    } catch (err) {
      console.error('Ошибка:', err);
      alert('Не удалось удалить новость.');
    }
  };

  if (loading) return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-alert system-alert-info">Загрузка новостей...</div>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-alert system-alert-error">{error}</div>
      </div>
    </div>
  );

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-flex-between system-mb-3">
          <h1 className="system-page-title">Список новостей</h1>
          <Link to="/admin/news/create" className="system-btn-primary">
            + Создать новость
          </Link>
        </div>
        
        <div className="system-grid system-grid-cols-2">
          {news.map((item) => {
            const coverUrl = item.cover;

            return (
              <div key={item.id} className={`system-content-card ${!item.isVisible ? 'system-opacity-50' : ''}`}>
                {coverUrl && (
                  <img src={coverUrl} alt={item.title} className="system-news-cover" />
                )}
                <div className="system-p-3">
                  <h3 className="system-card-title">{item.title}</h3>
                  <div className="system-flex-between system-mb-2">
                    <span className="system-text-muted system-text-sm">
                      {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                    </span>
                    {!item.isVisible && <span className="system-badge system-badge-warning">Скрыто</span>}
                  </div>
                  {/* Краткое превью htmlContent с customCss */}
                  {item.customCss && (
                    <style dangerouslySetInnerHTML={{ __html: item.customCss }} />
                  )}
                  <div
                    className="system-text-content system-mb-3"
                    dangerouslySetInnerHTML={{ __html: (item.htmlContent || '').slice(0, 300) + (item.htmlContent && item.htmlContent.length > 300 ? '...' : '') }}
                  />
                </div>
                <div className="system-card-actions">
                  <button
                    onClick={() => handleEdit(item.id)}
                    className="system-btn-outline system-btn-sm"
                    title="Редактировать"
                  >
                    ✏️ Изменить
                  </button>
                  <button
                    onClick={() => handleToggleVisibility(item.id)}
                    className={`system-btn-outline system-btn-sm ${item.isVisible ? 'system-btn-warning' : 'system-btn-success'}`}
                    title={item.isVisible ? 'Скрыть' : 'Показать'}
                  >
                    {item.isVisible ? '👁️ Скрыть' : '🚫 Показать'}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="system-btn-outline system-btn-sm system-btn-danger"
                    title="Удалить"
                  >
                    🗑️ Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};