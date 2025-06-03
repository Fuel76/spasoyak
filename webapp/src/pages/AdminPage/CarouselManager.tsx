import { useState, useEffect } from 'react';
// Удаляем старый CSS
// import './CarouselManager.css';

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
    <div>
      <h2 className="system-card-title">Управление каруселью</h2>
      
      <div className="system-form-row system-mb-3">
        <div className="system-form-group system-flex-1">
          <input
            type="text"
            placeholder="Введите URL изображения"
            value={newImageUrl}
            onChange={(e) => setNewImageUrl(e.target.value)}
            disabled={loading}
            className="system-form-input"
          />
        </div>
        <button 
          onClick={addImage} 
          disabled={loading || !newImageUrl.trim()}
          className="system-btn-primary"
        >
          {loading ? 'Добавление...' : 'Добавить изображение'}
        </button>
      </div>
      
      <div className="system-grid system-grid-cols-3">
        {images.length === 0 && (
          <div className="system-alert system-alert-info" style={{ gridColumn: '1 / -1' }}>
            Нет изображений в карусели
          </div>
        )}
        {images.map((image) => (
          <div className="system-content-card system-p-2" key={image.id}>
            <img 
              src={image.url} 
              alt="carousel" 
              className="system-news-cover"
              style={{ height: '150px' }}
            />
            <button 
              onClick={() => deleteImage(image.id)} 
              disabled={loading}
              className="system-btn-outline system-btn-sm system-btn-danger system-mt-2"
              style={{ width: '100%' }}
            >
              {loading ? 'Удаление...' : 'Удалить'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarouselManager;
