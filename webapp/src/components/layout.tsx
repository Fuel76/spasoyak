import '../App.css';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidemenu } from './Sidemenu';
import { Footer } from './Footer';

export const Layout = () => {
  return (
    <div className="layout">
      {/* Шапка */}
      <Header />

      {/* Контейнер для бокового меню и основного контента */}
      <div className="content-container">
        {/* Боковое меню */}
        <Sidemenu />

        {/* Контейнер для страниц */}
        <div className="page-content">
          <Outlet /> {/* Здесь будут отображаться страницы */}
        </div>
      </div>

      {/* Подвал */}
      <Footer />
    </div>
  );
};
