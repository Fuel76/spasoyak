import React from 'react';
import { Link } from 'react-router-dom';

export const AdminPage = () => {
  return (
    <div className="admin-container">
      <h1>Админпанель</h1>
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Управление страницами</h2>
          <Link to="/admin/pages">Список страниц</Link>
          <Link to="/create">Создать новую страницу</Link>
        </div>
        <div className="admin-section">
          <h2>Управление новостями</h2>
          <Link to="/admin/news">Список новостей</Link>
          <Link to="/news/add">Добавить новость</Link>
        </div>
      </div>
    </div>
  );
};