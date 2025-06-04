import footerLogo from '../assets/лого.png';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-main">
          <div className="footer-logo">
            <img src={footerLogo} alt="Логотип Спасо-Яковлевского Димитриева монастыря" />
          </div>
          <div className="footer-info">
            <h2>Спасо-Яковлевский Димитриев монастырь</h2>
            <p className="footer-subtitle">Место духовного возрождения и молитвы</p>
          </div>
        </div>
        
        <div className="footer-section footer-contact">
          <h3>Контакты</h3>
          <div className="contact-item">
            <span className="contact-label">Адрес:</span>
            <span>152151, Ярославская область, г. Ростов Великий</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Телефон:</span>
            <span>+7(48536)7-43-69</span>
          </div>
          <div className="contact-item">
            <span className="contact-label">Email:</span>
            <span>http://rostov-monastir.ru</span>
          </div>
        </div>
        
        <div className="footer-section footer-schedule">
          <h3>Богослужения</h3>
          <div className="schedule-item">
            <span>Понедельник - Пятница:</span>
            <span>Литургия: 8:00</span>
          </div>
          <div className="schedule-item">
            <span>Суббота:</span>
            <span>Литургия: 8:00</span>
          </div>
          <div className="schedule-item">
            <span>Воскресенье:</span>
            <span>Литургия: 9:00</span> 
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          <p>© 2025 Спасо-Яковлевский Димитриев монастырь. Все права защищены.</p>
        </div>
        <div className="footer-blessing">
          <p>Благословение настоятеля на создание сайта получено</p>
        </div>
      </div>
    </footer>
  );
};
