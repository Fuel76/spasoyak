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

  // Функция для динамического изменения размера шрифта
  const updateFontSize = () => {
    const screenWidth = window.innerWidth;
    const root = document.documentElement;
    
    // Базовый размер шрифта в зависимости от ширины экрана
    let baseFontPercent = 1.2; // базовый процент
    let minFont = 1.0;
    let maxFont = 4.0;
    
    if (screenWidth >= 2000) {
      // Очень широкие экраны - увеличиваем еще больше
      baseFontPercent = 2.0;
      maxFont = 8.0;
    } else if (screenWidth >= 1600) {
      // Широкие экраны
      baseFontPercent = 1.8;
      maxFont = 6.0;
    } else if (screenWidth >= 1400) {
      // Большие экраны
      baseFontPercent = 1.5;
      maxFont = 5.0;
    } else if (screenWidth <= 480) {
      // Мобильные устройства
      baseFontPercent = 0.9;
      minFont = 0.7;
      maxFont = 2.0;
    } else if (screenWidth <= 768) {
      // Планшеты
      baseFontPercent = 1.0;
      minFont = 0.8;
      maxFont = 2.5;
    } else if (screenWidth <= 1200) {
      // Средние экраны
      baseFontPercent = 1.1;
      minFont = 0.9;
      maxFont = 3.0;
    }
    
    // Рассчитываем расстояния между пунктами пропорционально размеру шрифта
    const spacingPercent = baseFontPercent * 0.8; // 80% от размера шрифта
    const minSpacing = Math.max(8, minFont * 16 * 0.5); // минимум 8px или 50% от минимального шрифта
    const maxSpacing = Math.min(32, maxFont * 16 * 0.2); // максимум 32px или 20% от максимального шрифта
    
    // Устанавливаем CSS переменные
    root.style.setProperty('--sidemenu-base-font-percent', `${baseFontPercent}vw`);
    root.style.setProperty('--sidemenu-min-font', `${minFont}rem`);
    root.style.setProperty('--sidemenu-max-font', `${maxFont}rem`);
    
    // Устанавливаем переменные для расстояний
    root.style.setProperty('--sidemenu-item-spacing', `${spacingPercent}vw`);
    root.style.setProperty('--sidemenu-item-spacing-min', `${minSpacing}px`);
    root.style.setProperty('--sidemenu-item-spacing-max', `${maxSpacing}px`);
  };

  useEffect(() => {
    // Устанавливаем начальный размер шрифта
    updateFontSize();
    
    // Добавляем обработчик изменения размера окна
    const handleResize = () => {
      updateFontSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Очищаем обработчик при размонтировании компонента
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
            <OrthodoxCalendar 
              compact={true}
              showReadings={false}
              showSaints={false}
              className="orthodox-calendar--sidemenu"
            />
          </div>
        </div>
      </div>
      {/* Мобильное бургер-меню-оверлей */}
      <div className="mobile-sidemenu-overlay" style={{ display: mobileOpen ? 'flex' : 'none' }}>
        <div className="burger-menu-links">
          {renderMobileMenu(menuItems)}
          <div style={{ marginTop: 32, width: '100%' }}>
            <OrthodoxCalendar 
              compact={true}
              showReadings={false}
              showSaints={false}
              className="orthodox-calendar--mobile"
            />
          </div>
        </div>
      </div>
      {/* Одна кнопка для открытия/закрытия */}
      <BurgerToggle />
    </>
  );
};