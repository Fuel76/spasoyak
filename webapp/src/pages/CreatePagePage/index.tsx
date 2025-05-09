import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageEditor } from '../../components/PageEditor/PageEditor';
import './CreatePagePage.css';

export const CreatePagePage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/admin/pages');
  };

  return (
    <div className="create-page">
      <div className="create-page__header">
        <button onClick={handleBack} className="back-button">
          ← Вернуться к списку страниц
        </button>
        <h1>Создание новой страницы</h1>
      </div>
      
      <PageEditor navigate={navigate} />
    </div>
  );
};