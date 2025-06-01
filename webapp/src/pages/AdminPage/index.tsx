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
          <Link to="/admin/pages" className="admin-link">Список страниц</Link>
          <Link to="/admin/pages/create" className="admin-link">Создать новую страницу</Link>
        </div>
        <div className="admin-section">
          <h2>Управление новостями</h2>
          <Link to="/admin/news" className="admin-link">Список новостей</Link>
          <Link to="/news/add" className="admin-link">Добавить новость</Link>
        </div>
        <div className="admin-section">
          <h2>Управление схемой сайта</h2>
          <Link to="/admin/sitemap" className="admin-link">Редактировать схему сайта</Link>
          <Link to="/admin/schedule" className="admin-link">Редактировать расписание богослужений</Link>
        </div>
        <div className="admin-section">
          <h2>Заявки на требы</h2>
          <div className="admin-treby-links">
            <Link to="/admin/treby" className="admin-link">Просмотр заявок</Link>
            <Link to="/admin/treby/form-fields" className="admin-link">Настройка полей формы</Link>
            <Link to="/admin/treby/form-fields/add" className="admin-link">Добавить поле формы</Link>
            <Link to="/admin/treby/pricing-rules" className="admin-link">Настройка правил ценообразования</Link>
            <Link to="/admin/treby/pricing-rules/add" className="admin-link">Добавить правило ценообразования</Link>
          </div>
        </div>
      </div>
      <CarouselManager />
      <style>{`
        .admin-sections {
          display: flex;
          flex-wrap: wrap;
          gap: 32px;
        }
        .admin-section {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 24px 32px;
          min-width: 260px;
          flex: 1 1 320px;
          max-width: 400px;
        }
        .admin-section h2 {
          font-size: 1.2rem;
          margin-bottom: 16px;
        }
        .admin-link {
          display: block;
          margin-bottom: 10px;
          color: #2a4d8f;
          font-weight: 500;
          text-decoration: none;
          transition: color 0.2s;
        }
        .admin-link:hover {
          color: #1a2d5c;
          text-decoration: underline;
        }
        .admin-treby-links {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        @media (max-width: 900px) {
          .admin-sections {
            flex-direction: column;
            gap: 20px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminPage;