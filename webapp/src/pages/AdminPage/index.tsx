import React from 'react';
import { Link } from 'react-router-dom';
import './AdminPage.css';
import CarouselManager from './CarouselManager';

const AdminPage = () => {
  return (
    <div className="admin-container">
      <h1>Админпанель</h1>
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Управление страницами</h2>
          <Link to="/admin/pages">Список страниц</Link>
          <Link to="/admin/pages/create">Создать новую страницу</Link>
        </div>
        <div className="admin-section">
          <h2>Управление новостями</h2>
          <Link to="/admin/news">Список новостей</Link>
          <Link to="/news/add">Добавить новость</Link>
        </div>
        <div className="admin-section">
          <h2>Управление схемой сайта</h2>
          <Link to="/admin/sitemap">Редактировать схему сайта</Link>
        </div>
        <div className="admin-section">
          <h2>Заявки на требы</h2>
          <Link to="/admin/treby">Просмотр заявок</Link>
        </div>
      </div>
      <CarouselManager />
    </div>
  );
};

export default AdminPage;