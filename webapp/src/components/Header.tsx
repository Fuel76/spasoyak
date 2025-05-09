import coverImage from '../assets/обложка.png';
import iconaImage from '../assets/ikona.png';

export const Header = () => {
  return (
    <header className="header">
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
        <a href="/treby" className="button">Требы</a>
      </div>
    </header>
  );
};