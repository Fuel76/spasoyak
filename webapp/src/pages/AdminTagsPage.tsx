import React from 'react';
import TagManager from '../components/TagManager';

const AdminTagsPage: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Управление тегами</h1>
        <p>Здесь вы можете создавать, редактировать и удалять теги для новостей</p>
      </div>
      <TagManager />
    </div>
  );
};

export default AdminTagsPage;
