import { Link, useNavigate } from 'react-router-dom'; // Импортируем Link и useNavigate
import { useEffect, useState } from 'react';
import './AdminNewsList.css'; // Создадим файл стилей

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

  if (loading) return <p>Загрузка новостей...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="admin-news-list-container">
      <div className="admin-news-header">
        <h1>Список новостей</h1>
        <Link to="/admin/news/create" className="admin-button admin-button-create">
          + Создать новость
        </Link>
      </div>
      <div className="admin-news-list">
        {news.map((item) => {
          const coverUrl = item.cover; // Используем прямую ссылку
          // Парсинг media остается таким же
          let mediaUrls: string[] = [];
          try {
            mediaUrls = typeof item.media === 'string' ? JSON.parse(item.media) : (Array.isArray(item.media) ? item.media : []);
          } catch { mediaUrls = []; }

          return (
            <div key={item.id} className={`admin-news-card ${!item.isVisible ? 'admin-news-card--hidden' : ''}`}>
              {coverUrl && (
                <img src={coverUrl} alt={item.title} className="admin-news-card__cover" />
              )}
              <div className="admin-news-card__body">
                <h3 className="admin-news-card__title">{item.title}</h3>
                <p className="admin-news-card__date">
                  {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                  {!item.isVisible && <span className="admin-news-card__badge">Скрыто</span>}
                </p>
                {/* Краткое превью htmlContent с customCss */}
                {item.customCss && (
                  <style dangerouslySetInnerHTML={{ __html: item.customCss }} />
                )}
                <div
                  className="admin-news-card__preview formatted-content"
                  dangerouslySetInnerHTML={{ __html: (item.htmlContent || '').slice(0, 300) + (item.htmlContent && item.htmlContent.length > 300 ? '...' : '') }}
                />
              </div>
              <div className="admin-news-card__actions">
                <button
                  onClick={() => handleEdit(item.id)}
                  className="admin-button admin-button-edit"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleToggleVisibility(item.id)}
                  className={`admin-button ${item.isVisible ? 'admin-button-hide' : 'admin-button-show'}`}
                  title={item.isVisible ? 'Скрыть' : 'Показать'}
                >
                  {item.isVisible ? '👁️' : '🚫'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="admin-button admin-button-delete"
                  title="Удалить"
                >
                  🗑️
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};