import { Link } from 'react-router-dom';
import './AdminPage.css';
import CarouselManager from './CarouselManager';

const AdminPage = () => {
  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Админпанель</h1>
        
        <div className="admin-sections">
          <div className="system-content-card">
            <h2>Управление страницами</h2>
            <Link to="/admin/pages" className="system-btn-link">Список страниц</Link>
            <Link to="/admin/pages/create" className="system-btn-link">Создать новую страницу</Link>
          </div>
          
          <div className="system-content-card">
            <h2>Управление новостями</h2>
            <Link to="/admin/news" className="system-btn-link">Список новостей</Link>
            <Link to="/news/add" className="system-btn-link">Добавить новость</Link>
          </div>
          
          <div className="system-content-card">
            <h2>Управление схемой сайта</h2>
            <Link to="/admin/sitemap" className="system-btn-link">Редактировать схему сайта</Link>
            <Link to="/admin/schedule" className="system-btn-link">Редактировать расписание богослужений</Link>
          </div>
          
          <div className="system-content-card">
            <h2>Заявки на требы</h2>
            <div className="admin-treby-links">
              <Link to="/admin/treby" className="system-btn-link">Просмотр заявок</Link>
              <Link to="/admin/treby/form-fields" className="system-btn-link">Настройка полей формы</Link>
              <Link to="/admin/treby/form-fields/add" className="system-btn-link">Добавить поле формы</Link>
              <Link to="/admin/treby/pricing-rules" className="system-btn-link">Настройка правил ценообразования</Link>
              <Link to="/admin/treby/pricing-rules/add" className="system-btn-link">Добавить правило ценообразования</Link>
            </div>
          </div>
        </div>
        
        <div className="system-content-card">
          <CarouselManager />
        </div>
      </div>
    </div>
  );
};

export default AdminPage;