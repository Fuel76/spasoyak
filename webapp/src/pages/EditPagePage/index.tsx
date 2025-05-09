import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageEditor } from '../../components/PageEditor/PageEditor';
import './EditPagePage.css';

export const EditPagePage: React.FC = () => {
  const { id, slug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();
  const pageId = id ? parseInt(id, 10) : undefined;

  const handleBack = () => {
    navigate('/admin/pages');
  };

  return (
    <div className="edit-page">
      <div className="edit-page__header">
        <button onClick={handleBack} className="back-button">
          ← Вернуться к списку страниц
        </button>
        <h1>Редактирование страницы</h1>
      </div>
      
      <PageEditor pageId={pageId} slug={slug} />
    </div>
  );
};