import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedNewsEditor } from '../components/EnhancedNewsEditor';
import './CreateNewsPage.css';

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
  headerStyle: 'default' | 'cover-blur' | 'cover-side';
  headerColor: string;
}

const CreateNewsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (newsData: NewsData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3000/api/news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...newsData,
          coverUrl: newsData.coverImage, // Преобразуем название поля для бэкенда
          authorId: 1, // TODO: получать из контекста аутентификации
          publishedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка при создании новости');
      }

      const createdNews = await response.json();
      navigate(`/news/${createdNews.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/news');
  };

  return (
    <div className="create-news-page">
      <div className="page-header">
        <h1>Создание новости</h1>
        <div className="header-actions">
          <button 
            type="button" 
            onClick={handleCancel}
            className="btn btn-secondary"
          >
            Отмена
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}        <div className="editor-container">
          <EnhancedNewsEditor
            onSave={handleSave}
            isLoading={isLoading}
            mode="create"
          />
        </div>
    </div>
  );
};

export default CreateNewsPage;
