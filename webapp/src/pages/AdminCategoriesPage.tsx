import React from 'react';
import CategoryManager from '../components/CategoryManager';

const AdminCategoriesPage: React.FC = () => {
  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Управление категориями</h1>
        <p>Здесь вы можете создавать, редактировать и удалять категории для новостей</p>
      </div>
      <CategoryManager />
    </div>
  );
};

export default AdminCategoriesPage;
