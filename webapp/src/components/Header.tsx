import coverImage from '../assets/обложка.png';
import ornamentImage from '../assets/Ornam.png';
import iconaImage from '../assets/ikona.png';

export const Header = () => {
  const decorativeElements = Array.from({ length: 3 }, (_, index) => index);

  return (
    <header className="header">
      {/* Декоративные изображения */}
      <div className="rotated-images-container">
        {decorativeElements.map((_, index) => (
          <img
            key={index}
            className="rotated-image"
            src={ornamentImage}
            alt={`Декоративное изображение ${index + 1}`}
            style={{ top: `${index * 41}vh` }}
          />
        ))}
      </div>

      {/* Основной контент шапки */}
      <img className="header-background" src={coverImage} alt="Фон" />
      <div className="header-title">
        Спасо-Яковлевский <br /> Димитриев монастырь
        <br /> в Ростове Великом
      </div>
      <img className="small-image" src={iconaImage} alt="Икона" />
      <div className="button-container">
        <div className="button">
          Расписание <br /> Богослужений
        </div>
        <div className="button">Требы</div>
      </div>
    </header>
  );
};