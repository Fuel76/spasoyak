import { useState, useEffect } from 'react';

interface MenuItem {
  id: number;
  title: string;
  link: string;
  mute: boolean;
  parentId?: number;
  children?: MenuItem[];
}

export const SiteMapEditor = () => {
  const [siteMap, setSiteMap] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/menu');
        const data = await response.json();
        setSiteMap(data);
      } catch (error) {
        console.error('Ошибка при загрузке пунктов меню:', error);
      }
    };

    fetchMenuItems();
  }, []);

  const addMenuItem = async (parentId?: number) => {
    const newItem = {
      title: 'Новый пункт',
      link: '#',
      mute: false,
      parentId,
    };

    try {
      const response = await fetch('http://localhost:3000/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      const createdItem = await response.json();
      setSiteMap((prev) =>
        parentId
          ? prev.map((item) =>
              item.id === parentId
                ? { ...item, children: [...(item.children || []), createdItem] }
                : item
            )
          : [...prev, createdItem]
      );
    } catch (error) {
      console.error('Ошибка при добавлении пункта меню:', error);
    }
  };

  const updateMenuItem = async (id: number, newTitle: string, newLink: string, newMute: boolean) => {
    try {
      await fetch(`http://localhost:3000/api/menu/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, link: newLink, mute: newMute }),
      });

      setSiteMap((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, title: newTitle, link: newLink, mute: newMute }
            : { ...item, children: item.children ? updateMenuItemRecursively(item.children, id, newTitle, newLink, newMute) : undefined }
        )
      );
    } catch (error) {
      console.error('Ошибка при обновлении пункта меню:', error);
    }
  };

  const updateMenuItemRecursively = (
    items: MenuItem[],
    id: number,
    newTitle: string,
    newLink: string,
    newMute: boolean
  ): MenuItem[] =>
    items.map((item) =>
      item.id === id
        ? { ...item, title: newTitle, link: newLink, mute: newMute }
        : { ...item, children: item.children ? updateMenuItemRecursively(item.children, id, newTitle, newLink, newMute) : undefined }
    );

  const deleteMenuItem = async (id: number) => {
    try {
      await fetch(`http://localhost:3000/api/menu/${id}`, {
        method: 'DELETE',
      });

      const deleteItems = (items: MenuItem[]): MenuItem[] =>
        items
          .filter((item) => item.id !== id)
          .map((item) => ({
            ...item,
            children: item.children ? deleteItems(item.children) : undefined,
          }));

      setSiteMap(deleteItems(siteMap));
    } catch (error) {
      console.error('Ошибка при удалении пункта меню:', error);
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Редактор схемы сайта</h1>
        
        <div className="system-content-card">
          <div className="system-flex-between system-mb-3">
            <h2 className="system-card-title">Структура меню</h2>
            <button 
              onClick={() => addMenuItem()} 
              className="system-btn-primary"
            >
              + Добавить пункт
            </button>
          </div>
          
          <SiteMapList
            items={siteMap}
            onAdd={addMenuItem}
            onUpdate={updateMenuItem}
            onDelete={deleteMenuItem}
          />
        </div>
      </div>
    </div>
  );
};

const SiteMapList = ({
  items,
  onAdd,
  onUpdate,
  onDelete,
}: {
  items: MenuItem[];
  onAdd: (parentId: number) => void;
  onUpdate: (id: number, newTitle: string, newLink: string, newMute: boolean) => void;
  onDelete: (id: number) => void;
}) => (
  <div className="system-list">
    {items.map((item) => (
      <div key={item.id} className="system-content-card">
        <div className="system-form-row">
          <div className="system-form-group">
            <label className="system-form-label">Название</label>
            <input
              type="text"
              value={item.title}
              onChange={(e) => onUpdate(item.id, e.target.value, item.link, item.mute)}
              className="system-form-input"
              placeholder="Название пункта меню"
            />
          </div>
          
          <div className="system-form-group">
            <label className="system-form-label">Ссылка</label>
            <input
              type="text"
              value={item.link}
              onChange={(e) => onUpdate(item.id, item.title, e.target.value, item.mute)}
              className="system-form-input"
              placeholder="/страница или https://..."
            />
          </div>
          
          <div className="system-form-group">
            <label className="system-form-label system-d-flex system-align-center system-gap-1">
              <input
                type="checkbox"
                checked={item.mute}
                onChange={(e) => onUpdate(item.id, item.title, item.link, e.target.checked)}
              />
              Скрыть из меню
            </label>
          </div>
        </div>
        
        <div className="system-flex-between system-mt-2">
          <div className="system-d-flex system-gap-1">
            <button 
              onClick={() => onAdd(item.id)} 
              className="system-btn-outline system-btn-sm"
              title="Добавить подменю"
            >
              + Подменю
            </button>
          </div>
          
          <button 
            onClick={() => onDelete(item.id)} 
            className="system-btn-outline system-btn-sm system-btn-danger"
            title="Удалить пункт"
          >
            🗑️ Удалить
          </button>
        </div>
        
        {item.children && item.children.length > 0 && (
          <div className="system-mt-3" style={{ paddingLeft: '1rem', borderLeft: '2px solid var(--border-color)' }}>
            <SiteMapList
              items={item.children}
              onAdd={onAdd}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          </div>
        )}
      </div>
    ))}
  </div>
);