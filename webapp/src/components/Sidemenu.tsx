import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './Sidemenu.css';

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
  const sidemenuWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/menu');
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Ошибка при загрузке пунктов меню:', error);
      }
    };

    fetchMenuItems();
  }, []);

  useEffect(() => {
    function applyZoomCompensation() {
      // Используем visualViewport.scale, если доступно, иначе devicePixelRatio
      const zoom = window.visualViewport?.scale || window.devicePixelRatio || 1;
      const wrapper = sidemenuWrapperRef.current;
      if (wrapper) {
        // Компенсируем zoom обратным scale
        wrapper.style.transform = `scale(${1 / zoom})`;
        wrapper.style.transformOrigin = 'top left';
        // Не трогаем left/top/width/height!
      }
    }
    applyZoomCompensation();
    window.addEventListener('resize', applyZoomCompensation);
    window.visualViewport?.addEventListener('resize', applyZoomCompensation);
    window.visualViewport?.addEventListener('scroll', applyZoomCompensation);
    return () => {
      window.removeEventListener('resize', applyZoomCompensation);
      window.visualViewport?.removeEventListener('resize', applyZoomCompensation);
      window.visualViewport?.removeEventListener('scroll', applyZoomCompensation);
    };
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

  return (
    <div className="sidemenu-absolute-container">
      <div className="sidemenu-fixed-wrapper" ref={sidemenuWrapperRef}>
        <div className="sidemenu">{renderMenu(menuItems)}</div>
      </div>
    </div>
  );
};