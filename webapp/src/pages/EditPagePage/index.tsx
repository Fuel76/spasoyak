import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageEditor } from '../../components/PageEditor/PageEditor';
// Удаляем старый CSS
// import './EditPagePage.css';

export const EditPagePage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const pageId = id ? parseInt(id, 10) : undefined;

  const handleBack = () => {
    navigate('/admin/pages');
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <div className="system-mb-3">
          <button onClick={handleBack} className="system-btn-link">
            ← Вернуться к списку страниц
          </button>
          <h1 className="system-page-title">Редактирование страницы</h1>
        </div>
        
        <PageEditor pageId={pageId} slug={slug} />
      </div>
    </div>
  );
};