import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Select from 'react-select';
import './EnhancedNewsEditor.css';
import SunEditorCore from 'suneditor/src/lib/core';
import ImageUploadSettings, { ImageUploadSettings as UploadSettings } from './ImageUploadSettings';

interface Category {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface Tag {
  id: number;
  name: string;
  slug: string;
  color?: string;
}

interface NewsData {
  title: string;
  content: string;
  excerpt: string;
  categoryId: number | null;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  slug: string;
  isPinned: boolean;
  isVisible: boolean;
  coverImage?: string;
  headerStyle?: 'default' | 'cover-blur' | 'cover-side';
  headerColor?: string;
}

// Цвет по умолчанию для шапки (основной фирменный цвет сайта)
const DEFAULT_HEADER_COLOR = '#8b6c4f';

interface NewsEditorProps {
  newsId?: number;
  initialData?: NewsData;
  onSave?: (newsData: NewsData) => void;
  isLoading?: boolean;
  mode?: 'create' | 'edit';
}

export const EnhancedNewsEditor: React.FC<NewsEditorProps> = ({ 
  newsId, 
  initialData, 
  onSave, 
  isLoading = false, 
  mode = 'create' 
}) => {
  // Основные поля новости
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [customCss, setCustomCss] = useState('');
  
  // SEO и метаданные
  const [slug, setSlug] = useState('');
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  // Категории и теги
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  
  // Настройки публикации
  const [publishedAt, setPublishedAt] = useState<string>('');
  const [isPinned, setIsPinned] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  
  // Состояния UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'seo' | 'advanced' | 'history'>('main');
  
  // Настройки загрузки изображений
  const [uploadSettings, setUploadSettings] = useState<UploadSettings>({
    usePostImages: true,
    autoUploadToPostImages: true,
    fallbackToLocal: true
  });
  
  // История изменений
  const [history, setHistory] = useState<Array<{ title: string; htmlContent: string; timestamp: Date }>>([]);

  // Настройки шапки новости
  const [headerStyle, setHeaderStyle] = useState<'default' | 'cover-blur' | 'cover-side'>('default');
  const [headerColor, setHeaderColor] = useState(DEFAULT_HEADER_COLOR);
  
  const sunEditorRef = React.useRef<SunEditorCore>(null);

  // Регистрируем кастомные плагины в SunEditor
  React.useEffect(() => {
    // Регистрируем плагины глобально
    if (typeof window !== 'undefined') {
      (window as any).showImageAlignmentModal = showImageAlignmentModal;
      (window as any).showVideoInsertModal = showVideoInsertModal;
    }
  }, []);

  // Функция для добавления кастомных кнопок
  const addCustomButtons = (_editor: SunEditorCore) => {
    // Этот код будет выполнен после инициализации редактора
    // В будущем здесь можно добавить дополнительную логику
  };

  // Загрузка данных при инициализации
  useEffect(() => {
    loadCategories();
    loadTags();
    if (newsId) {
      loadNews();
    } else if (initialData) {
      // Инициализация с переданными данными
      initializeWithData(initialData);
    } else {
      // Установка даты публикации по умолчанию для новой новости
      setPublishedAt(new Date().toISOString().slice(0, 16));
    }
  }, [newsId, initialData]);

  const initializeWithData = (data: NewsData & { cover?: string }) => {
    setTitle(data.title);
    setHtmlContent(data.content);
   
    setSlug(data.slug);
    setMetaTitle(data.metaTitle);
    setMetaDescription(data.metaDescription);
    setIsPinned(data.isPinned);
    setIsVisible(data.isVisible);
    if (data.coverImage || (data as any).cover) {
      setCoverUrl(data.coverImage || (data as any).cover);
    }
    setHeaderStyle(typeof data.headerStyle === 'string' ? data.headerStyle : 'default');
    setHeaderColor(typeof data.headerColor === 'string' && data.headerColor ? data.headerColor : DEFAULT_HEADER_COLOR);
    // Категория и теги будут установлены после загрузки списков
  };

  // Автогенерация slug из заголовка
  useEffect(() => {
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^а-яё\w\s-]/gi, '')
        .replace(/\s+/g, '-')
        .substring(0, 100);
      setSlug(generatedSlug);
    }
  }, [title]);

  // Установка категории и тегов после загрузки данных
  useEffect(() => {
    if (initialData && categories.length > 0 && tags.length > 0) {
      if (initialData.categoryId) {
        const category = categories.find(cat => cat.id === initialData.categoryId);
        if (category) setSelectedCategory(category);
      }
      if (initialData.tags && initialData.tags.length > 0) {
        const selectedTagObjects = tags.filter(tag => 
          initialData.tags.includes(tag.name)
        );
        setSelectedTags(selectedTagObjects);
      }
    }
  }, [initialData, categories, tags]);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }
  };

  const loadTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки тегов:', error);
    }
  };

  const loadNews = async () => {
    if (!newsId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/news/${newsId}`);
      if (response.ok) {
        const news = await response.json();
        setTitle(news.title || '');
        setHtmlContent(news.htmlContent || '');
        setExcerpt(news.excerpt || '');
        setCoverUrl(news.cover || '');
        setCustomCss(news.customCss || '');
        setSlug(news.slug || '');
        setMetaTitle(news.metaTitle || '');
        setMetaDescription(news.metaDescription || '');
        setIsPinned(news.isPinned || false);
        setIsVisible(news.isVisible !== false);
        
        if (news.publishedAt) {
          setPublishedAt(new Date(news.publishedAt).toISOString().slice(0, 16));
        }
        
        if (news.category) {
          setSelectedCategory(news.category);
        }
        
        if (news.tags) {
          setSelectedTags(news.tags.map((nt: any) => nt.tag));
        }
        
        try {
          const media = typeof news.media === 'string' ? JSON.parse(news.media) : news.media;
          setMediaUrls(Array.isArray(media) ? media : []);
        } catch {
          setMediaUrls([]);
        }
      }
    } catch (error) {
      setError('Ошибка загрузки новости');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMediaUrl = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl('');
    }
  };

  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i: number) => i !== index));
  };

  const addToHistory = () => {
    setHistory(prev => [
      { title, htmlContent, timestamp: new Date() },
      ...prev.slice(0, 9)
    ]);
  };

  const restoreFromHistory = (index: number) => {
    if (window.confirm('Восстановить эту версию? Текущие изменения будут потеряны.')) {
      const item = history[index];
      setTitle(item.title);
      setHtmlContent(item.htmlContent);
      setActiveTab('main');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите заголовок новости');
      return;
    }

    try {
      setLoading(true);
      
      const newsData: NewsData = {
        title,
        content: htmlContent,
        excerpt,
        categoryId: selectedCategory?.id || null,
        tags: selectedTags.map(tag => tag.name),
        metaTitle,
        metaDescription,
        slug,
        isPinned,
        isVisible,
        coverImage: coverUrl || undefined,
        headerStyle,
        headerColor
      };

      if (onSave) {
        await onSave(newsData);
      } else {
        // Fallback к старой логике если onSave не передан
        const method = newsId ? 'PUT' : 'POST';
        const url = newsId ? `/api/news/${newsId}` : '/api/news';
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...newsData,
            coverUrl: newsData.coverImage, // Преобразуем название поля для бэкенда
            tagIds: selectedTags.map(tag => tag.id), // для совместимости с API
          }),
        });

        if (response.ok) {
          await response.json();
          alert(newsId ? 'Новость успешно обновлена!' : 'Новость успешно создана!');
        } else {
          const errorData = await response.json();
          alert(`Ошибка: ${errorData.error || response.statusText}`);
        }
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert('Сетевая ошибка или ошибка сервера.');
    } finally {
      setLoading(false);
    }
  };

  // Обработчик загрузки изображений с поддержкой PostImages
  const handleImageUpload = async (_targetElement: any, _index: number, state: string, info: any, _remainingFilesCount: number, core: any) => {
    if (state === 'create') {
      const files = info.files;
      const formData = new FormData();
      
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }
      
      // Добавляем настройки PostImages если включены
      if (uploadSettings.usePostImages) {
        formData.append('usePostImages', 'true');
      }

      try {
        const response = await fetch('/api/media/upload', {
          method: 'POST',
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          const imageUrl = result.file?.url || result.url;
          
          // Создаем модальное окно для выбора типа вставки
          showImageInsertModal(imageUrl, result.file?.fileName || result.filename || 'Uploaded image', core);
        } else {
          console.error('Ошибка загрузки изображения');
          alert('Ошибка при загрузке изображения');
        }
      } catch (error) {
        console.error('Ошибка загрузки:', error);
        alert('Ошибка при загрузке изображения');
      }
    }
  };

  // Функция для показа модального окна выбора типа вставки изображения
  const showImageInsertModal = (imageUrl: string, altText: string, core: any, currentType: string = 'none', currentSize: string = 'medium') => {
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'image-insert-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Выберите способ вставки изображения</h3>
          <div class="image-preview">
            <img src="${imageUrl}" alt="${altText}" style="max-width: 200px; max-height: 150px;">
          </div>
          <div class="insert-options">
            <button class="insert-btn" data-type="full">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="img-placeholder full"></div>
                <div class="text-line"></div>
              </div>
              <span>На всю ширину</span>
            </button>
            <button class="insert-btn" data-type="left">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="content-row">
                  <div class="img-placeholder left"></div>
                  <div class="text-block">
                    <div class="text-line short"></div>
                    <div class="text-line short"></div>
                  </div>
                </div>
                <div class="text-line"></div>
              </div>
              <span>Слева с обтеканием</span>
            </button>
            <button class="insert-btn" data-type="right">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="content-row">
                  <div class="text-block">
                    <div class="text-line short"></div>
                    <div class="text-line short"></div>
                  </div>
                  <div class="img-placeholder right"></div>
                </div>
                <div class="text-line"></div>
              </div>
              <span>Справа с обтеканием</span>
            </button>
            <button class="insert-btn" data-type="center">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="img-placeholder center"></div>
                <div class="text-line"></div>
              </div>
              <span>По центру</span>
            </button>
          </div>
          <div class="size-options">
            <label>
              Размер изображения:
              <select class="size-select">
                <option value="small">Маленький (25%)</option>
                <option value="medium" selected>Средний (50%)</option>
                <option value="large">Большой (75%)</option>
                <option value="full">Оригинальный (100%)</option>
              </select>
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel">Отмена</button>
            <button class="btn-insert">Вставить</button>
          </div>
        </div>
      </div>
    `;

    // Добавляем стили для модального окна
    const style = document.createElement('style');
    style.textContent = `
      .image-insert-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
      }
      
      .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .modal-content {
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      }
      
      .modal-content h3 {
        margin: 0 0 15px 0;
        color: #333;
        font-size: 18px;
      }
      
      .image-preview {
        text-align: center;
        margin: 15px 0;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
      
      .insert-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin: 20px 0;
      }
      
      .insert-btn {
        border: 2px solid #ddd;
        background: white;
        padding: 15px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        text-align: center;
      }
      
      .insert-btn:hover {
        border-color: #007bff;
        background: #f8f9fa;
      }
      
      .insert-btn.selected {
        border-color: #007bff;
        background: #e7f3ff;
      }
      
      .option-preview {
        width: 100%;
        height: 60px;
        margin-bottom: 8px;
        position: relative;
      }
      
      .text-line {
        height: 3px;
        background: #ddd;
        margin: 3px 0;
        border-radius: 1px;
      }
      
      .text-line.short {
        width: 70%;
      }
      
      .content-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin: 3px 0;
      }
      
      .text-block {
        flex: 1;
      }
      
      .img-placeholder {
        background: #007bff;
        border-radius: 2px;
      }
      
      .img-placeholder.full {
        width: 100%;
        height: 20px;
        margin: 3px 0;
      }
      
      .img-placeholder.left {
        width: 25px;
        height: 20px;
        flex-shrink: 0;
      }
      
      .img-placeholder.right {
        width: 25px;
        height: 20px;
        flex-shrink: 0;
      }
      
      .img-placeholder.center {
        width: 40px;
        height: 20px;
        margin: 3px auto;
      }
      
      .size-options {
        margin: 15px 0;
      }
      
      .size-options label {
        display: block;
        font-weight: 500;
        color: #333;
      }
      
      .size-select {
        margin-top: 5px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        width: 100%;
      }
      
      .modal-actions {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 20px;
      }
      
      .btn-cancel, .btn-insert {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }
      
      .btn-cancel {
        background: #6c757d;
        color: white;
      }
      
      .btn-cancel:hover {
        background: #5a6268;
      }
      
      .btn-insert {
        background: #007bff;
        color: white;
      }
      
      .btn-insert:hover {
        background: #0056b3;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    let selectedType = currentType !== 'none' ? currentType : 'full';
    let selectedSize = currentSize;

    // Обработчики событий
    const insertButtons = modal.querySelectorAll('.insert-btn');
    insertButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        insertButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedType = btn.getAttribute('data-type') || 'medium';
      });
    });

    // Устанавливаем соответствующий вариант как выбранный по умолчанию
    const defaultButton = Array.from(insertButtons).find(btn => 
      btn.getAttribute('data-type') === selectedType
    ) || insertButtons[0];
    defaultButton.classList.add('selected');

    const sizeSelect = modal.querySelector('.size-select') as HTMLSelectElement;
    sizeSelect.value = selectedSize; // Устанавливаем текущий размер
    sizeSelect.addEventListener('change', () => {
      selectedSize = sizeSelect.value;
    });

    const cancelBtn = modal.querySelector('.btn-cancel');
    const insertBtn = modal.querySelector('.btn-insert');

    const closeModal = () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    };

    cancelBtn?.addEventListener('click', closeModal);

    insertBtn?.addEventListener('click', () => {
      insertImageWithAlignment(imageUrl, altText, selectedType, selectedSize, core);
      closeModal();
    });

    // Закрытие по клику вне модального окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        closeModal();
      }
    });
  };

  // Функция для вставки изображения с выбранным выравниванием (современный адаптивный подход)
  const insertImageWithAlignment = (imageUrl: string, altText: string, alignType: string, size: string, core: any) => {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = altText;
    
    // Удаляем старые inline стили - используем только CSS классы для адаптивности
    img.style.cssText = '';
    
    // Применяем современные CSS классы для адаптивного обтекания
    switch (alignType) {
      case 'full':
        img.className = 'text-wrap-full';
        break;
        
      case 'left':
        img.className = 'text-wrap-left';
        break;
        
      case 'right':
        img.className = 'text-wrap-right';
        break;
        
      case 'center':
        img.className = 'text-wrap-center';
        break;
        
      default:
        img.className = 'text-wrap-full';
    }
    
    // Добавляем атрибут для размера (используется в CSS через CSS переменные)
    img.setAttribute('data-size', size);
    
    core.insertNode(img, null, false);
  };

  // Функция для создания видео с обтеканием (современный адаптивный подход)
  const insertVideoWithAlignment = (videoUrl: string, alignType: string, size: string, core: any) => {
    let videoHtml = '';
    
    // Определяем тип видео
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      // YouTube видео
      let videoId = '';
      if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
      } else if (videoUrl.includes('watch?v=')) {
        videoId = videoUrl.split('watch?v=')[1].split('&')[0];
      }
      
      if (videoId) {
        videoHtml = `<iframe width="560" height="315" src="https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&controls=1&autoplay=0" frameborder="0" allowfullscreen></iframe>`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      // Vimeo видео
      const videoId = videoUrl.split('vimeo.com/')[1];
      if (videoId) {
        videoHtml = `<iframe src="https://player.vimeo.com/video/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
      }
    } else {
      // Обычное видео
      videoHtml = `<video controls><source src="${videoUrl}" type="video/mp4">Ваш браузер не поддерживает видео.</video>`;
    }
    
    if (!videoHtml) return;
    
    const videoContainer = document.createElement('div');
    videoContainer.innerHTML = videoHtml;
    const videoElement = videoContainer.firstChild as HTMLElement;
    
    // Удаляем старые inline стили и используем CSS классы
    videoElement.style.cssText = '';
    
    // Применяем современные CSS классы для адаптивного обтекания
    switch (alignType) {
      case 'full':
        videoElement.className = 'text-wrap-full';
        break;
        
      case 'left':
        videoElement.className = 'text-wrap-left';
        break;
        
      case 'right':
        videoElement.className = 'text-wrap-right';
        break;
        
      case 'center':
        videoElement.className = 'text-wrap-center';
        break;
        
      default:
        videoElement.className = 'text-wrap-full';
    }
    
    // Добавляем атрибут для размера
    videoElement.setAttribute('data-size', size);
    
    core.insertNode(videoElement, null, false);
  };

  // Функция для показа модального окна вставки видео
  const showVideoInsertModal = (core: any) => {
    const modal = document.createElement('div');
    modal.className = 'video-insert-modal';
    modal.innerHTML = `
      <div class="modal-overlay">
        <div class="modal-content">
          <h3>Вставить видео</h3>
          <div class="video-url-input">
            <label>URL видео (YouTube, Vimeo или прямая ссылка):</label>
            <input type="url" class="video-url" placeholder="https://www.youtube.com/watch?v=..." />
          </div>
          <div class="insert-options">
            <button class="insert-btn" data-type="full">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="video-placeholder full"></div>
                <div class="text-line"></div>
              </div>
              <span>На всю ширину</span>
            </button>
            <button class="insert-btn" data-type="left">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="content-row">
                  <div class="video-placeholder left"></div>
                  <div class="text-block">
                    <div class="text-line short"></div>
                    <div class="text-line short"></div>
                  </div>
                </div>
                <div class="text-line"></div>
              </div>
              <span>Слева с обтеканием</span>
            </button>
            <button class="insert-btn" data-type="right">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="content-row">
                  <div class="text-block">
                    <div class="text-line short"></div>
                    <div class="text-line short"></div>
                  </div>
                  <div class="video-placeholder right"></div>
                </div>
                <div class="text-line"></div>
              </div>
              <span>Справа с обтеканием</span>
            </button>
            <button class="insert-btn" data-type="center">
              <div class="option-preview">
                <div class="text-line"></div>
                <div class="video-placeholder center"></div>
                <div class="text-line"></div>
              </div>
              <span>По центру</span>
            </button>
          </div>
          <div class="size-options">
            <label>
              Размер видео:
              <select class="size-select">
                <option value="small">Маленький (25%)</option>
                <option value="medium" selected>Средний (50%)</option>
                <option value="large">Большой (75%)</option>
                <option value="full">Оригинальный (100%)</option>
              </select>
            </label>
          </div>
          <div class="modal-actions">
            <button class="btn-cancel">Отмена</button>
            <button class="btn-insert">Вставить</button>
          </div>
        </div>
      </div>
    `;

    // Добавляем стили для видео
    const style = document.createElement('style');
    style.textContent = `
      .video-insert-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
      }
      
      .video-url-input {
        margin: 15px 0;
      }
      
      .video-url-input label {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 5px;
      }
      
      .video-url {
        width: 100%;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .video-placeholder {
        background: #28a745;
        border-radius: 2px;
      }
      
      .video-placeholder.full {
        width: 100%;
        height: 20px;
        margin: 3px 0;
      }
      
      .video-placeholder.left {
        width: 30px;
        height: 20px;
        flex-shrink: 0;
      }
      
      .video-placeholder.right {
        width: 30px;
        height: 20px;
        flex-shrink: 0;
      }
      
      .video-placeholder.center {
        width: 50px;
        height: 20px;
        margin: 3px auto;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(modal);

    let selectedType = 'full';
    let selectedSize = 'medium';

    // Обработчики событий
    const insertButtons = modal.querySelectorAll('.insert-btn');
    insertButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        insertButtons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedType = btn.getAttribute('data-type') || 'full';
      });
    });

    insertButtons[0].classList.add('selected');

    const sizeSelect = modal.querySelector('.size-select') as HTMLSelectElement;
    sizeSelect.addEventListener('change', () => {
      selectedSize = sizeSelect.value;
    });

    const videoUrlInput = modal.querySelector('.video-url') as HTMLInputElement;
    const cancelBtn = modal.querySelector('.btn-cancel');
    const insertBtn = modal.querySelector('.btn-insert');

    const closeModal = () => {
      document.body.removeChild(modal);
      document.head.removeChild(style);
    };

    cancelBtn?.addEventListener('click', closeModal);

    insertBtn?.addEventListener('click', () => {
      const videoUrl = videoUrlInput.value.trim();
      if (!videoUrl) {
        alert('Пожалуйста, введите URL видео');
        return;
      }
      
      insertVideoWithAlignment(videoUrl, selectedType, selectedSize, core);
      closeModal();
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal.querySelector('.modal-overlay')) {
        closeModal();
      }
    });
    
    // Фокус на поле ввода
    setTimeout(() => videoUrlInput.focus(), 100);
  };



  // Функция для показа модального окна настройки обтекания существующего изображения (современный подход с CSS классами)
  const showImageAlignmentModal = (img: HTMLImageElement, core: any) => {
    // Определяем текущий тип выравнивания по CSS классам вместо inline стилей
    let currentType = 'full'; // значение по умолчанию
    
    const classList = img.classList;
    
    if (classList.contains('text-wrap-left')) {
      currentType = 'left';
    } else if (classList.contains('text-wrap-right')) {
      currentType = 'right';
    } else if (classList.contains('text-wrap-center')) {
      currentType = 'center';
    } else if (classList.contains('text-wrap-full')) {
      currentType = 'full';
    } else {
      // Фаллбэк для старых изображений с inline стилями
      const currentFloat = img.style.float || 'none';
      const currentDisplay = img.style.display || 'inline';
      
      if (currentFloat === 'left') currentType = 'left';
      else if (currentFloat === 'right') currentType = 'right';
      else if (currentDisplay === 'block' && img.style.margin.includes('auto')) currentType = 'center';
      else if (img.style.width === '100%') currentType = 'full';
    }

    // Получаем размер из data-атрибута или определяем по размеру изображения
    const currentSize = img.getAttribute('data-size') || 'medium';

    // Показываем модальное окно с текущим типом выравнивания
    showImageInsertModal(img.src, img.alt, core, currentType, currentSize);
    
    // Удаляем старое изображение после выбора нового стиля
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          const addedImg = Array.from(mutation.addedNodes).find(node => 
            node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'IMG'
          ) as HTMLImageElement;
          
          if (addedImg && addedImg.src === img.src) {
            img.remove();
            observer.disconnect();
          }
        }
      });
    });
    
    observer.observe(core.context.element.wysiwyg, { childList: true, subtree: true });
  };

  // Расширенные настройки SunEditor с максимальным функционалом
  const editorOptions = {
    height: '600px',
    buttonList: [
      // Основные инструменты
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['paragraphStyle', 'blockquote'],
      
      // Форматирование текста
      ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle'],
      ['removeFormat'],
      
      // Выравнивание и списки
      ['outdent', 'indent', 'align', 'horizontalRule', 'list', 'lineHeight'],
      
      // Вставка контента
      ['table', 'link', 'image', 'video', 'audio'],
      
      // Дополнительные инструменты (без math для избежания ошибки KaTeX)
      ['imageGallery'],
      ['fullScreen', 'showBlocks', 'codeView', 'preview'],
      ['print', 'save', 'template']
    ],
    
    // Настройки изображений
    imageFileInput: true,
    imageUrlInput: true,
    imageUploadUrl: '/api/media/upload',
    imageUploadSizeLimit: 10000000, // 10MB
    imageAccept: '.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg',
    imageResizing: true,
    imageHeightShow: true,
    imageAlignShow: true,
    imageMultipleFile: true,
    
    // Обработчик загрузки изображений
    onImageUploadBefore: handleImageUpload,
    
    // Наст
    videoFileInput: false,
    videoUrlInput: true,
    videoResizing: true,
    videoRatioShow: true,
    videoHeightShow: true,
    videoAlignShow: true,
    youtubeQuery: 'rel=0&showinfo=0&controls=1&autoplay=0',
    
    // Настройки таблиц
    tableCellControllerPosition: 'top',
    
    // Настройки ссылок
    linkProtocol: 'https://',
    linkRel: [],
    linkTargetNewWindow: false,
    
    // Темплейты
    templates: [
      {
        name: 'Цитата с автором',
        html: '<blockquote class="quote-with-author">"Ваша цитата здесь"<cite>— Автор цитаты</cite></blockquote>'
      },
      {
        name: 'Важное объявление',
        html: '<div class="announcement"><h3>🔔 Важное объявление</h3><p>Текст объявления...</p></div>'
      },
      {
        name: 'Две колонки',
        html: '<div class="two-columns"><div class="column"><h4>Колонка 1</h4><p>Содержимое первой колонки...</p></div><div class="column"><h4>Колонка 2</h4><p>Содержимое второй колонки...</p></div></div>'
      }
    ],
    
    // Настройки по умолчанию
    defaultStyle: 'font-family: Georgia, "Times New Roman", serif; font-size: 16px; line-height: 1.8; color: #333;',
    historyStackDelayTime: 400
  };

  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name,
    color: cat.color
  }));

  const tagOptions = tags.map(tag => ({
    value: tag.id,
    label: tag.name,
    color: tag.color
  }));

  if (loading && !htmlContent) {
    return (
      <div className="enhanced-news-editor">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Загрузка редактора...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="enhanced-news-editor">
        <div className="error-state">
          <h3>Ошибка загрузки</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-news-editor">
      <div className="editor-header">
        <h1 className="editor-title">
          {newsId ? 'Редактирование новости' : 'Создание новости'}
        </h1>
        
        <div className="editor-toolbar">
          <button 
            type="button" 
            onClick={() => setPreviewMode(!previewMode)}
            className={`btn ${previewMode ? 'btn-secondary' : 'btn-primary'}`}
          >
            {previewMode ? '✏️ Редактор' : '👁️ Предпросмотр'}
          </button>
        </div>

        {/* Система вкладок */}
        <div className="editor-tabs">
          <button 
            type="button" 
            onClick={() => setActiveTab('main')}
            className={`tab-button ${activeTab === 'main' ? 'active' : ''}`}
          >
            📝 Основное
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('seo')}
            className={`tab-button ${activeTab === 'seo' ? 'active' : ''}`}
          >
            🔍 SEO
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('advanced')}
            className={`tab-button ${activeTab === 'advanced' ? 'active' : ''}`}
          >
            ⚙️ Дополнительно
          </button>
          
          <button 
            type="button" 
            onClick={() => setActiveTab('history')}
            className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
          >
            📚 История ({history.length})
          </button>
          
          <button 
            type="button" 
            onClick={addToHistory}
            className="btn btn-outline btn-save-version"
          >
            💾 Сохранить версию
          </button>
        </div>
      </div>

      {/* Контент в зависимости от активной вкладки */}
      <div className="tab-content">
        {activeTab === 'main' && (
          <div className="main-tab">
            {/* Основная форма */}
            <div className="editor-content">
              <div className="editor-sidebar">
                {/* Категория */}
                <div className="form-group">
                  <label className="form-label">Категория</label>
                  <Select
                    value={selectedCategory ? { value: selectedCategory.id, label: selectedCategory.name } : null}
                    onChange={(option) => {
                      const category = categories.find(cat => cat.id === option?.value);
                      setSelectedCategory(category || null);
                    }}
                    options={categoryOptions}
                    placeholder="Выберите категорию"
                    isClearable
                    className="react-select"
                  />
                </div>

                {/* Теги */}
                <div className="form-group">
                  <label className="form-label">Теги</label>
                  <Select
                    value={selectedTags.map(tag => ({ value: tag.id, label: tag.name }))}
                    onChange={(options) => {
                      const tagIds = options.map(opt => opt.value);
                      const newSelectedTags = tags.filter(tag => tagIds.includes(tag.id));
                      setSelectedTags(newSelectedTags);
                    }}
                    options={tagOptions}
                    placeholder="Выберите теги"
                    isMulti
                    className="react-select"
                  />
                </div>

                {/* Настройки публикации */}
                <div className="form-group">
                  <label className="form-label">Дата публикации</label>
                  <input
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                    />
                    📌 Закрепить новость
                  </label>
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                    />
                    👁️ Показывать на сайте
                  </label>
                </div>
              </div>

              <div className="editor-main">
                {/* Заголовок */}
                <div className="form-group">
                  <label className="form-label">Заголовок новости *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="form-input title-input"
                    placeholder="Введите заголовок новости"
                    required
                  />
                </div>

                {/* Краткое описание */}
                <div className="form-group">
                  <label className="form-label">Краткое описание</label>
                  <textarea
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Краткое описание для анонса новости"
                  />
                </div>

                {/* Обложка новости */}
                <div className="form-group">
                  <label className="form-label">Обложка новости</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/cover.jpg"
                  />
                  {coverUrl && (
                    <img src={coverUrl} alt="Превью обложки" className="cover-preview" />
                  )}
                </div>

                {/* Настройки шапки новости */}
                <div className="form-group">
                  <label className="form-label">Стиль шапки</label>
                  <select
                    className="form-input"
                    value={headerStyle}
                    onChange={e => setHeaderStyle(e.target.value as 'default' | 'cover-blur' | 'cover-side')}
                  >
                    <option value="default">Классический</option>
                    <option value="cover-blur">С обложкой и размытием</option>
                    <option value="cover-side">Обложка сбоку</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Цвет шапки</label>
                  <input
                    type="color"
                    className="form-input"
                    value={headerColor}
                    onChange={e => setHeaderColor(e.target.value)}
                    style={{ width: 48, height: 32, padding: 0, border: 'none', background: 'none' }}
                  />
                  <span style={{ marginLeft: 12 }}>{headerColor}</span>
                </div>

                {/* Настройки загрузки изображений */}
                <ImageUploadSettings 
                  settings={uploadSettings}
                  onSettingsChange={setUploadSettings}
                />

                {/* Редактор или предпросмотр */}
                {previewMode ? (
                  <div className="preview-container">
                    <h3 className="form-label">Предпросмотр</h3>
                    <div className="news-preview">
                      <style dangerouslySetInnerHTML={{ __html: customCss }} />
                      <h1>{title}</h1>
                      {excerpt && <p className="excerpt">{excerpt}</p>}
                      {coverUrl && <img src={coverUrl} alt={title} className="cover-image" />}
                      <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                    </div>
                  </div>
                ) : (
                  <div className="form-group">
                    <label className="form-label">Содержание новости</label>
                    <SunEditor
                      getSunEditorInstance={(editor) => {
                        sunEditorRef.current = editor;
                        
                        // Добавляем кастомные кнопки после инициализации редактора
                        setTimeout(() => {
                          addCustomButtons(editor);
                        }, 100);
                      }}
                      setOptions={editorOptions}
                      setContents={htmlContent}
                      onChange={setHtmlContent}
                      placeholder="Введите содержание новости..."
                    />
                    
                    {/* Дополнительная панель инструментов для текстового обтекания */}
                    <div className="editor-toolbar">
                      <button
                        type="button"
                        onClick={() => {
                          if (sunEditorRef.current) {
                            // Проверяем выделение через DOM
                            const selection = window.getSelection();
                            if (selection && selection.rangeCount > 0) {
                              const range = selection.getRangeAt(0);
                              const selectedElement = range.commonAncestorContainer;
                              
                              // Ищем изображение в выделении или родительских элементах
                              let imgElement: HTMLImageElement | null = null;
                              if (selectedElement.nodeType === Node.ELEMENT_NODE) {
                                const element = selectedElement as HTMLElement;
                                imgElement = element.tagName === 'IMG' ? element as HTMLImageElement : element.querySelector('img');
                              } else if (selectedElement.parentElement) {
                                imgElement = selectedElement.parentElement.tagName === 'IMG' ? 
                                  selectedElement.parentElement as HTMLImageElement : 
                                  selectedElement.parentElement.querySelector('img');
                              }
                              
                              if (imgElement) {
                                showImageAlignmentModal(imgElement, sunEditorRef.current);
                              } else {
                                alert('Выберите изображение для настройки обтекания');
                              }
                            } else {
                              alert('Выберите изображение для настройки обтекания');
                            }
                          }
                        }}
                        className="btn btn-outline"
                        title="Настройка обтекания изображения"
                      >
                        📷 Обтекание изображения
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (sunEditorRef.current) {
                            showVideoInsertModal(sunEditorRef.current);
                          }
                        }}
                        className="btn btn-outline"
                        title="Вставить видео с обтеканием"
                      >
                        🎥 Видео с обтеканием
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="seo-tab">
            <div className="seo-panel">
              <h3>SEO настройки</h3>
              <div className="seo-content">
                <div className="form-group">
                  <label className="form-label">URL (slug)</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="form-input"
                    placeholder="url-novosti"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Meta Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    className="form-input"
                    placeholder="SEO заголовок для поисковиков"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="form-textarea"
                    rows={3}
                    placeholder="Описание для поисковиков (до 160 символов)"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="advanced-tab">
            <div className="advanced-panel">
              <h3>Дополнительные настройки</h3>
              <div className="advanced-content">
                {/* Обложка */}
                <div className="form-group">
                  <label className="form-label">Ссылка на обложку</label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                  />
                  {coverUrl && (
                    <img src={coverUrl} alt="Превью обложки" className="cover-preview" />
                  )}
                </div>

                {/* Медиа файлы */}
                <div className="form-group">
                  <label className="form-label">Дополнительные изображения</label>
                  <div className="media-input-group">
                    <input
                      type="url"
                      value={newMediaUrl}
                      onChange={(e) => setNewMediaUrl(e.target.value)}
                      className="form-input"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button type="button" onClick={handleAddMediaUrl} className="btn btn-primary">
                      Добавить
                    </button>
                  </div>
                  
                  {mediaUrls.length > 0 && (
                    <div className="media-list">
                      {mediaUrls.map((url: string, index: number) => (
                        <div key={index} className="media-item">
                          <img src={url} alt={`media-${index}`} className="media-thumb" />
                          <span className="media-url">{url}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveMediaUrl(index)}
                            className="btn btn-danger btn-sm"
                          >
                            Удалить
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Пользовательский CSS */}
                <div className="form-group">
                  <label className="form-label">Пользовательский CSS</label>
                  <textarea
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    className="form-textarea css-textarea"
                    rows={6}
                    placeholder="Введите CSS стили для этой новости"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-tab">
            <div className="history-panel">
              <h3>История изменений</h3>
              {history.length === 0 ? (
                <p>История пуста</p>
              ) : (
                <div className="history-list">
                  {history.map((item, idx) => (
                    <div key={idx} className="history-item">
                      <div className="history-info">
                        <span className="history-time">{item.timestamp.toLocaleString()}</span>
                        <span className="history-title">{item.title}</span>
                      </div>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => restoreFromHistory(idx)}
                      >
                        Восстановить
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="editor-actions">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading || isLoading}
          className="btn btn-primary btn-large"
        >
          {(loading || isLoading) ? 'Сохранение...' : (mode === 'edit' ? 'Обновить новость' : 'Создать новость')}
        </button>
      </div>
    </div>
  );
};

