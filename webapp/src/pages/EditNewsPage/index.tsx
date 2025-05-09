import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NewsEditor } from '../../components/NewsEditor';
import './EditNewsPage.css';

export const EditNewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const newsId = id ? parseInt(id, 10) : undefined;

  const handleBack = () => {
    navigate('/admin/news'); // Вернуться к списку новостей
  };

  return (
    <div className="edit-news-page">
      <div className="edit-news-header">
        <button onClick={handleBack} className="back-button">
          ← Вернуться к списку
        </button>
      </div>
      
      {!id ? (
        <div className="error-message">Не указан ID новости</div>
      ) : isNaN(newsId!) ? (
        <div className="error-message">Некорректный ID новости</div>
      ) : (
        <NewsEditor newsId={newsId} />
      )}
    </div>
  );
};