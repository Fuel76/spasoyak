import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Sidemenu.css';
import OrthodoxCalendar from '../components/OrthodoxCalendar';

interface MenuItem {
  id: number;
  title: string;
  link: string;
  mute: boolean;
  children?: MenuItem[];
}

export const Sidemenu = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidemenuWrapperRef = useRef<HTMLDivElement>(null);
  const sidemenuAbsoluteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Ошибка при загрузке пунктов меню:', error);
      }
    };

    fetchMenuItems();
  }, []);

  // Обновление переменной --sidemenu-height на root при изменении высоты
  useEffect(() => {
    function setSidemenuHeightVar() {
      if (sidemenuAbsoluteRef.current) {
        const height = sidemenuAbsoluteRef.current.offsetHeight;
        document.documentElement.style.setProperty('--sidemenu-height', height + 'px');
      }
    }
    setSidemenuHeightVar();
    window.addEventListener('resize', setSidemenuHeightVar);
    return () => window.removeEventListener('resize', setSidemenuHeightVar);
  }, []);

  const toggleItem = (id: number) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const renderMenu = (items: MenuItem[]) =>
    items
      .filter((item) => !item.mute) // Исключаем скрытые пункты
      .map((item) => (
        <div
          key={item.id}
          className={`sidemenu-item ${openItems.includes(item.id) ? 'open' : ''}`}
          onClick={() => toggleItem(item.id)}
        >
          <div className="sidemenu-item-content">
            <Link to={item.link} className="sidemenu-item-title">
              {item.title}
            </Link>
            {item.children && item.children.length > 0 && (
              <div className="sidemenu-item-icon"></div>
            )}
          </div>
          {item.children && item.children.length > 0 && (
            <div className="sidemenu-children">{renderMenu(item.children)}</div>
          )}
        </div>
      ));

  // Мобильное бургер-меню-оверлей с функционалом как в Header.tsx
  const renderMobileMenu = (items: MenuItem[]) =>
    items
      .filter((item) => !item.mute)
      .map((item) => (
        <div key={item.id}>
          <Link to={item.link} className="burger-menu-link" onClick={() => setMobileOpen(false)}>
            {item.title}
          </Link>
          {item.children && item.children.length > 0 && (
            <div style={{ paddingLeft: 16 }}>{renderMobileMenu(item.children)}</div>
          )}
        </div>
      ));

  // Одна кнопка для открытия/закрытия бургер-меню
  const BurgerToggle = () => (
    <div className="burger-icon" onClick={() => setMobileOpen((v) => !v)}>
      <span style={{ transform: mobileOpen ? 'rotate(45deg) translate(6px, 6px)' : 'none' }}></span>
      <span style={{ opacity: mobileOpen ? 0 : 1 }}></span>
      <span style={{ transform: mobileOpen ? 'rotate(-45deg) translate(7px, -7px)' : 'none' }}></span>
    </div>
  );

  return (
    <>
      <div className="sidemenu-absolute-container" ref={sidemenuAbsoluteRef}>
        <div className="sidemenu-fixed-wrapper" ref={sidemenuWrapperRef}>
          <div className="sidemenu">
            {renderMenu(menuItems)}
            <OrthodoxCalendar />
          </div>
        </div>
      </div>
      {/* Мобильное бургер-меню-оверлей */}
      <div className="mobile-sidemenu-overlay" style={{ display: mobileOpen ? 'flex' : 'none' }}>
        <div className="burger-menu-links">
          {renderMobileMenu(menuItems)}
          <div style={{ marginTop: 32, width: '100%' }}>
            <OrthodoxCalendar />
          </div>
        </div>
      </div>
      {/* Одна кнопка для открытия/закрытия */}
      <BurgerToggle />
    </>
  );
};