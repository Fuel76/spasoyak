import { useState, useEffect } from 'react';
import ImageUploadSettings, { ImageUploadSettings as UploadSettings } from '../../components/ImageUploadSettings';
// Удаляем старый CSS
// import './CarouselManager.css';

const CarouselManager = () => {
  const [images, setImages] = useState<{ id: number; url: string; source?: string }[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    usePostImages: true,
    autoUploadToPostImages: true,
    fallbackToLocal: true
  });

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Можно загружать только изображения');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    if (uploadSettings.usePostImages) {
      formData.append('usePostImages', 'true');
    }

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.file?.url) {
          // Добавляем загруженное изображение в карусель
          const carouselResponse = await fetch('http://localhost:3000/api/carousel', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: result.file.url }),
          });
          
          if (carouselResponse.ok) {
            const carouselData = await carouselResponse.json();
            setImages((prev) => [...prev, { ...carouselData, source: result.file.source }]);
          }
        }
      } else {
        throw new Error('Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      alert('Ошибка при загрузке файла');
    } finally {
      setLoading(false);
      event.target.value = '';
    }
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
      
      <ImageUploadSettings
        settings={uploadSettings}
        onSettingsChange={setUploadSettings}
      />
      
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
          {loading ? 'Добавление...' : 'Добавить по URL'}
        </button>
      </div>

      <div className="system-form-row system-mb-3">
        <label className="system-btn-outline" style={{ cursor: 'pointer', textAlign: 'center' }}>
          📤 Загрузить изображение
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={loading}
            style={{ display: 'none' }}
          />
        </label>
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
            {image.source && (
              <div className={`source-badge ${image.source}`} style={{ margin: '8px 0', fontSize: '0.7rem' }}>
                {image.source === 'postimages' ? '🌐 PostImages' : '📁 Локально'}
              </div>
            )}
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
