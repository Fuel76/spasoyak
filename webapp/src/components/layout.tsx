import '../App.css';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidemenu } from './Sidemenu';
import { Footer } from './Footer';
import ornamentImage from '../assets/Ornam.png';

export const Layout = () => {
  const decorativeElements = Array.from({ length: 10 }, (_, index) => index);

  return (
    <div className="layout">
      {/* Контейнер для декоративных изображений */}
      <div className="rotated-images-container">
        {decorativeElements.map((_, index) => (
          <img
            key={index}
            className="rotated-image"
            src={ornamentImage}
            alt={`Декоративное изображение ${index + 1}`}
          />
        ))}
      </div>

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
