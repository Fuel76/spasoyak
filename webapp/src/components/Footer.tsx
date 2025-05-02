import footerLogo from '../assets/лого.png';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-logo">
        <img src={footerLogo} alt="Логотип" />
      </div>
      <div className="footer-text">
        <h2>Спасо-Яковлевский Димитриев Монастырь</h2>
        <p>High level experience in web design and development knowledge, producing quality work.</p>
        <p>© 2025 All Rights Reserved</p>
      </div>
    </footer>
  );
};
