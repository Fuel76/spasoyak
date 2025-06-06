import React, { useState } from 'react';
import './ImageUploadSettings.css';

export interface ImageUploadSettings {
  usePostImages: boolean;
  autoUploadToPostImages: boolean;
  fallbackToLocal: boolean;
}

interface ImageUploadSettingsProps {
  settings: ImageUploadSettings;
  onSettingsChange: (settings: ImageUploadSettings) => void;
}

const ImageUploadSettings: React.FC<ImageUploadSettingsProps> = ({
  settings,
  onSettingsChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSettingChange = (key: keyof ImageUploadSettings, value: boolean) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="image-upload-settings">
      <button
        className="settings-toggle"
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        ⚙️ Настройки загрузки
        <span className={`arrow ${isExpanded ? 'expanded' : ''}`}>▼</span>
      </button>
      
      {isExpanded && (
        <div className="settings-panel">
          <div className="settings-group">
            <h4>🖼️ Сервис загрузки изображений</h4>
            
            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.usePostImages}
                onChange={(e) => handleSettingChange('usePostImages', e.target.checked)}
              />
              <span className="checkmark"></span>
              <div className="setting-info">
                <div className="setting-title">Использовать PostImages.org</div>
                <div className="setting-description">
                  Загружать изображения на внешний сервис PostImages.org
                </div>
              </div>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.autoUploadToPostImages}
                onChange={(e) => handleSettingChange('autoUploadToPostImages', e.target.checked)}
                disabled={!settings.usePostImages}
              />
              <span className="checkmark"></span>
              <div className="setting-info">
                <div className="setting-title">Автоматическая загрузка</div>
                <div className="setting-description">
                  Автоматически загружать на PostImages при выборе файла
                </div>
              </div>
            </label>

            <label className="setting-item">
              <input
                type="checkbox"
                checked={settings.fallbackToLocal}
                onChange={(e) => handleSettingChange('fallbackToLocal', e.target.checked)}
                disabled={!settings.usePostImages}
              />
              <span className="checkmark"></span>
              <div className="setting-info">
                <div className="setting-title">Резервное локальное хранение</div>
                <div className="setting-description">
                  Сохранять локально, если PostImages недоступен
                </div>
              </div>
            </label>
          </div>

          <div className="service-status">
            <div className="status-item">
              <span className="status-indicator local">🟢</span>
              <span>Локальное хранилище: Доступно</span>
            </div>
            <div className="status-item">
              <span className="status-indicator postimages">
                {settings.usePostImages ? '🟡' : '⚪'}
              </span>
              <span>PostImages.org: {settings.usePostImages ? 'Включен' : 'Выключен'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploadSettings;
