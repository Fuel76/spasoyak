import { useState, useEffect } from 'react';
import './CarouselManager.css';

const CarouselManager = () => {
  const [images, setImages] = useState<{ id: number; url: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/api/carousel')
      .then((res) => res.json())
      .then((data) => setImages(data));
  }, []);

  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setLoading(true);
    fetch('http://localhost:3000/api/carousel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newImageUrl }),
    })
      .then((res) => res.json())
      .then((data) => setImages((prev) => [...prev, data]))
      .finally(() => setLoading(false));
    setNewImageUrl('');
  };

  const deleteImage = (id: number) => {
    setLoading(true);
    fetch(`http://localhost:3000/api/carousel/${id}`, { method: 'DELETE' })
      .then(() => setImages((prev) => prev.filter((img) => img.id !== id)))
      .finally(() => setLoading(false));
  };

  return (
    <div className="carousel-manager-container">
      <h2>Управление каруселью</h2>
      <div className="carousel-add-form">
        <input
          type="text"
          placeholder="Введите URL изображения"
          value={newImageUrl}
          onChange={(e) => setNewImageUrl(e.target.value)}
          disabled={loading}
        />
        <button onClick={addImage} disabled={loading || !newImageUrl.trim()}>
          Добавить изображение
        </button>
      </div>
      <div className="carousel-preview-list">
        {images.length === 0 && <div className="carousel-empty">Нет изображений</div>}
        {images.map((image) => (
          <div className="carousel-preview-card" key={image.id}>
            <img src={image.url} alt="carousel" />
            <button onClick={() => deleteImage(image.id)} disabled={loading}>
              Удалить
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager;
