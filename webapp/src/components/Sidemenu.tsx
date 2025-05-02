import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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

  return <div className="sidemenu">{renderMenu(menuItems)}</div>;
};