import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EnhancedNewsEditor } from '../../components/EnhancedNewsEditor';
import '../EditNewsPage/EditNewsPage.css'; // Используем те же стили

export const CreateNewsPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/news');
  };

  return (
    <div className="edit-news-page">
      <div className="edit-news-header">
        <button onClick={handleBack} className="back-button">
          ← Вернуться к списку
        </button>
      </div>
      <EnhancedNewsEditor mode="create" />
    </div>
  );
};