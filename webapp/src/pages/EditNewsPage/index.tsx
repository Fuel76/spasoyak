import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EnhancedNewsEditor } from '../../components/EnhancedNewsEditor';
import './EditNewsPage.css';

interface NewsData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: number | null;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  isPinned: boolean;
  isVisible: boolean;
  coverImage?: string;
}

export const EditNewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const newsId = id ? parseInt(id, 10) : undefined;

  useEffect(() => {
    if (newsId) {
      fetchNewsData();
    }
  }, [newsId]);

  const fetchNewsData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/news/${newsId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Ошибка при загрузке новости');
      }

      const data = await response.json();
      setNewsData({
        title: data.title,
        content: data.content,
        excerpt: data.excerpt || '',
        categoryId: data.categoryId,
        tags: data.tags?.map((tag: any) => tag.name) || [],
        metaTitle: data.metaTitle || '',
        metaDescription: data.metaDescription || '',
        slug: data.slug,
        isPinned: data.isPinned || false,
        isVisible: data.isVisible !== false,
        coverImage: data.coverImage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (updatedNewsData: NewsData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/news/${newsId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(updatedNewsData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при обновлении новости');
      }

      const updatedNews = await response.json();
      navigate(`/news/${updatedNews.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/news');
  };

  if (!id || isNaN(newsId!)) {
    return (
      <div className="edit-news-page">
        <div className="error-message">Некорректный ID новости</div>
      </div>
    );
  }

  if (isLoading && !newsData) {
    return (
      <div className="edit-news-page">
        <div className="loading-message">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="edit-news-page">
      <div className="page-header">
        <h1>Редактирование новости</h1>
        <div className="header-actions">
          <button onClick={handleBack} className="btn btn-secondary">
            ← Вернуться к списку
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {newsData && (
        <div className="editor-container">
          <EnhancedNewsEditor
            initialData={newsData}
            onSave={handleSave}
            isLoading={isLoading}
            mode="edit"
          />
        </div>
      )}
    </div>
  );
};