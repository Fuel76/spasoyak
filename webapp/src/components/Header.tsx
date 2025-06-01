import { useState, useEffect, useRef, useCallback } from 'react';
import React from 'react';
import headerImage from '../assets/Шапка.svg';
import scheduleIcon from '../assets/Расписание.svg';
import trebyIcon from '../assets/Требы.svg';

interface MenuItem {
  id: number;
  title: string;
  link: string;
  mute: boolean;
  children?: MenuItem[];
}

const staticLinks = [
  { label: 'О монастыре', href: '/about' },
  { label: 'Расписание Богослужений', href: '/schedule' },
  { label: 'Требы', href: '/treby' },
];

function BurgerMenu() {
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    fetch('/api/menu')
      .then((res) => res.json())
      .then((data) => setMenuItems(data.filter((item: MenuItem) => !item.mute)))
      .catch(() => setMenuItems([]));
  }, []);

  const renderMenu = (items: MenuItem[]): React.ReactNode =>
    items.map((item) => (
      <div key={item.id}>
        <a href={item.link} className="burger-menu-link" onClick={() => setOpen(false)}>
          {item.title}
        </a>
        {item.children && item.children.length > 0 && (
          <div style={{ paddingLeft: 16 }}>
            {renderMenu(item.children)}
          </div>
        )}
      </div>
    ));

  return (
    <div className="burger-menu">
      <div className="burger-icon" onClick={() => setOpen(true)}>
        <span></span>
        <span></span>
        <span></span>
      </div>
      {open && (
        <div className="burger-dropdown">
          <button className="burger-close" onClick={() => setOpen(false)}>&times;</button>
          <div className="burger-menu-links">
            {staticLinks.map(link => (
              <a key={link.href} href={link.href} className="burger-menu-link" onClick={() => setOpen(false)}>
                {link.label}
              </a>
            ))}
            {renderMenu(menuItems)}
          </div>
        </div>
      )}
    </div>
  );
}

export const Header = () => {
  const headerRef = useRef<HTMLElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Универсальная функция пересчёта высоты
  const setHeaderHeightVar = useCallback(() => {
    if (headerRef.current) {
      // Если есть aspect-ratio, считаем по ширине
      const style = window.getComputedStyle(headerRef.current);
      const aspectRatio = style.getPropertyValue('aspect-ratio');
      let height = headerRef.current.offsetHeight;
      if (aspectRatio) {
        const [w, h] = aspectRatio.split('/').map(Number);
        if (w && h) {
          height = headerRef.current.offsetWidth * (h / w);
        }
      }
      document.documentElement.style.setProperty('--header-height', height + 'px');
    }
  }, []);

  useEffect(() => {
    setHeaderHeightVar();
    window.addEventListener('resize', setHeaderHeightVar);
    return () => window.removeEventListener('resize', setHeaderHeightVar);
  }, [setHeaderHeightVar]);

  // Пересчёт после загрузки изображения
  useEffect(() => {
    if (imgRef.current) {
      imgRef.current.addEventListener('load', setHeaderHeightVar);
      return () => imgRef.current?.removeEventListener('load', setHeaderHeightVar);
    }
  }, [setHeaderHeightVar]);

  return (
    <header className="header" ref={headerRef}>
      <img className="header-background" src={headerImage} alt="Шапка" ref={imgRef} />
      <div className="button-container">
        <a href="/schedule" className="button">
          <img src={scheduleIcon} alt="Расписание Богослужений" className="button-icon" />
        </a>
        <a href="/treby" className="button">
          <img src={trebyIcon} alt="Требы" className="button-icon" />
        </a>
      </div>
      <BurgerMenu />
    </header>
  );
};