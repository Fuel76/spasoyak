import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageUploadSettings, { ImageUploadSettings as UploadSettings } from '../../components/ImageUploadSettings';
import './AdminMedia.css';

interface MediaFile {
  fileName: string;
  filePath: string;
  url: string;
  size: number;
  createdAt: string;
  source?: 'local' | 'postimages';
}

const AdminMediaPage: React.FC = () => {
  const [images, setImages] = useState<MediaFile[]>([]);
  const [documents, setDocuments] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'images' | 'documents'>('images');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    usePostImages: true,
    autoUploadToPostImages: true,
    fallbackToLocal: true
  });

  useEffect(() => {
    fetchMediaFiles();
  }, []);

  const fetchMediaFiles = async () => {
    try {
      const [imagesResponse, documentsResponse] = await Promise.all([
        fetch('/api/media/images'),
        fetch('/api/media/documents')
      ]);

      if (imagesResponse.ok) {
        const imagesData = await imagesResponse.json();
        setImages(imagesData || []);
      }

      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        setDocuments(documentsData || []);
      }
    } catch (error) {
      console.error('Ошибка загрузки медиафайлов:', error);
      // Fallback to mock data for development
      setImages([]);
      setDocuments([]);
      showMessage('error', 'Ошибка при загрузке медиафайлов. Используются тестовые данные.');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    
    // Добавляем настройки загрузки для изображений
    if (activeTab === 'images' && uploadSettings.usePostImages) {
      formData.append('usePostImages', 'true');
    }

    try {
      setUploadProgress(0);
      
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          setUploadProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      const response = await new Promise<Response>((resolve, reject) => {
        xhr.onload = () => {
          try {
            const responseData = JSON.parse(xhr.response);
            resolve(new Response(JSON.stringify(responseData), { status: xhr.status }));
          } catch {
            resolve(new Response(xhr.response, { status: xhr.status }));
          }
        };
        xhr.onerror = () => reject(new Error('Ошибка загрузки'));
        xhr.open('POST', '/api/media/upload');
        xhr.send(formData);
      });

      if (response.ok) {
        const result = await response.json();
        if (result.file?.source === 'postimages') {
          showMessage('success', '✅ Файл успешно загружен на PostImages.org');
        } else {
          showMessage('success', '📁 Файл успешно загружен локально');
        }
        fetchMediaFiles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка загрузки на сервере');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      showMessage('error', `Ошибка при загрузке файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    } finally {
      setUploadProgress(null);
      // Сбрасываем input
      event.target.value = '';
    }
  };

  const handleDeleteFile = async (filePath: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот файл?')) {
      return;
    }

    try {
      const response = await fetch(`/api/media/${encodeURIComponent(filePath)}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showMessage('success', 'Файл успешно удален');
        fetchMediaFiles();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Ошибка удаления файла');
      }
    } catch (error) {
      console.error('Ошибка удаления файла:', error);
      showMessage('error', `Ошибка при удалении файла: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="admin-media-page">
        <div className="admin-media-header">
          <div className="admin-media-title">
            <h1>🖼️ Медиа библиотека</h1>
            <p>Загрузка файлов...</p>
          </div>
        </div>
      </div>
    );
  }

  const currentFiles = activeTab === 'images' ? images : documents;

  return (
    <div className="admin-media-page">
      <div className="admin-media-header">
        <div className="admin-media-title">
          <h1>🖼️ Медиа библиотека</h1>
          <p>Управление изображениями и документами</p>
        </div>
        <div className="admin-media-actions">
          <Link to="/admin" className="admin-btn admin-btn-outline">
            ← Назад в админку
          </Link>
        </div>
      </div>

      {message && (
        <div className={`media-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="admin-media-controls">
        <div className="media-tabs">
          <button
            className={`tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
          >
            🖼️ Изображения ({images.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveTab('documents')}
          >
            📄 Документы ({documents.length})
          </button>
        </div>

        <div className="upload-section">
          <ImageUploadSettings
            settings={uploadSettings}
            onSettingsChange={setUploadSettings}
          />
          
          <label className="upload-btn">
            ⬆️ Загрузить {activeTab === 'images' ? 'изображение' : 'документ'}
            <input
              type="file"
              accept={activeTab === 'images' ? 'image/*' : '.pdf,.doc,.docx,.txt,.rtf'}
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </label>
          {uploadProgress !== null && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="media-grid">
        {currentFiles.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'images' ? '🖼️' : '📄'}
            </div>
            <h3>Нет файлов</h3>
            <p>Загрузите первый {activeTab === 'images' ? 'файл изображения' : 'документ'}</p>
          </div>
        ) : (
          currentFiles.map((file, index) => (
            <div key={index} className="media-item">
              <div className="media-preview">
                {activeTab === 'images' ? (
                  <img
                    src={file.url}
                    alt={file.fileName}
                    loading="lazy"
                  />
                ) : (
                  <div className="document-icon">
                    📄
                  </div>
                )}
              </div>
              
              <div className="media-info">
                <h4 className="media-name" title={file.fileName}>
                  {file.fileName}
                  {file.source && (
                    <span className={`source-badge ${file.source}`}>
                      {file.source === 'postimages' ? '🌐 PostImages' : '📁 Локально'}
                    </span>
                  )}
                </h4>
                <div className="media-meta">
                  <span className="media-size">{formatFileSize(file.size)}</span>
                  <span className="media-date">{formatDate(file.createdAt)}</span>
                </div>
                <div className="media-actions">
                  <button
                    className="media-btn copy-btn"
                    onClick={() => navigator.clipboard.writeText(file.url)}
                    title="Копировать ссылку"
                  >
                    📋
                  </button>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-btn view-btn"
                    title="Открыть"
                  >
                    👁️
                  </a>
                  <button
                    className="media-btn delete-btn"
                    onClick={() => handleDeleteFile(file.filePath)}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMediaPage;
