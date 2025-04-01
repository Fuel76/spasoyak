import '../App.css';
import coverImage from '../assets/обложка.png'; // Импорт изображения
import ornamentImage from '../assets/Ornam.png'; // Импорт нового локального изображения
import iconaImage from '../assets/ikona.png';

export const Layout = () => {
  // Генерация массива для декоративных элементов
  const decorativeElements = Array.from({ length: 3 }, (_, index) => index); // Примерное количество элементов

  return (
    <div className="layout">
      <div className="app">
        {/* Rotated Images Section */}
        <div className="rotated-images-container">
          {decorativeElements.map((_, index) => (
            <img
              key={index}
              className="rotated-image"
              src={ornamentImage}
              alt={`Декоративное изображение ${index + 1}`}
              style={{ top: `${index * 41}vh` }} // Отступ сверху для каждого изображения
            />
          ))}
        </div>

        {/* Header Section */}
        <header className="header">
          <img
            className="header-background"
            src={coverImage} // Использование локального изображения
            alt="Фон"
          />
          <div className="header-title">
            Спасо-Яковлевский <br /> Димитриев монастырь<br /> в Ростове Великом
          </div>
          <img
            className="small-image"
            src={iconaImage} // Использование локального изображения
            alt="Икона"
          />
          <div className="button-container">
            <div className="button">Расписание <br /> Богослужений</div>
            <div className="button">Требы</div>
          </div>
        </header>

        {/* Main Content Section */}
        <main className="main-content">
          <div className="sidemenu">
            <div className="sidemenu-item">Информация</div>
            {[...Array(8)].map((_, index) => (
              <div key={index} className="sidemenu-item">
                Элемент {index + 1}
              </div>
            ))}
          </div>
        </main>

        {/* Footer Section */}
        <footer className="footer">
          <div className="footer-logo">
            <img src="https://placehold.co/375x203" alt="Логотип" />
          </div>
          <div className="footer-text">
            <h2>Спасо-Яковлевский Димитриев Монастырь</h2>
            <p>
              High level experience in web design and development knowledge,
              producing quality work.
            </p>
            <p>© 2025 All Rights Reserved</p>
          </div>
        </footer>
      </div>
    </div>
  );
};