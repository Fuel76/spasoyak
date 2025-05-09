import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const [images, setImages] = useState<{ id: number; url: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    fetch('http://localhost:3000/api/carousel')
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  const addImage = () => {
    fetch('http://localhost:3000/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newImageUrl }),
    })
      .then((res) => res.json())
      .then((data) => setImages((prev) => [...prev, data]));
    setNewImageUrl('');
  };

  const deleteImage = (id: number) => {
    fetch(`http://localhost:3000/api/carousel/${id}`, { method: 'DELETE' })
      .then(() => setImages((prev) => prev.filter((img) => img.id !== id)));
  };

  return (
    <div className="admin-container">
      <h1>Админпанель</h1>
      <div className="admin-sections">
        <div className="admin-section">
          <h2>Управление страницами</h2>
          <Link to="/admin/pages">Список страниц</Link>
          {/* Обновлено: правильная ссылка на создание страницы */}
          <Link to="/admin/pages/create">Создать новую страницу</Link>
        </div>
        <div className="admin-section">
          <h2>Управление новостями</h2>
          <Link to="/admin/news">Список новостей</Link>
          <Link to="/news/add">Добавить новость</Link>
        </div>
        <div className="admin-section">
          <h2>Управление схемой сайта</h2>
          <Link to="/admin/sitemap">Редактировать схему сайта</Link>
        </div>
        <div className="admin-section">
          <h2>Заявки на требы</h2>
          <Link to="/admin/treby">Просмотр заявок</Link>
        </div>
        <div className="admin-section">
          <h2>Управление каруселью</h2>
          <input
            type="text"
            placeholder="Введите URL изображения"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <button onClick={addImage}>Добавить изображение</button>
          <ul>
            {images.map((image) => (
              <li key={image.id}>
                <img src={image.url} alt="carousel" style={{ width: '100px' }} />
                <button onClick={() => deleteImage(image.id)}>Удалить</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;