import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Select from 'react-select';
import './EnhancedNewsEditor.css';
import SunEditorCore from 'suneditor/src/lib/core';

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
}

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
  const [showSeoPanel, setShowSeoPanel] = useState(false);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  
  // История изменений
  const [history, setHistory] = useState<Array<{ title: string; htmlContent: string; timestamp: Date }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const sunEditorRef = React.useRef<SunEditorCore>(null);

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

  const initializeWithData = (data: NewsData) => {
    setTitle(data.title);
    setHtmlContent(data.content);
    setExcerpt(data.excerpt);
    setSlug(data.slug);
    setMetaTitle(data.metaTitle);
    setMetaDescription(data.metaDescription);
    setIsPinned(data.isPinned);
    setIsVisible(data.isVisible);
    if (data.coverImage) {
      setCoverUrl(data.coverImage);
    }
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
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
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
      setShowHistory(false);
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
        coverImage: coverUrl || undefined
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
    imageUploadUrl: '/api/upload/upload-image-from-editor',
    imageUploadSizeLimit: 10000000, // 10MB
    imageAccept: '.jpg, .jpeg, .png, .gif, .webp, .bmp, .svg',
    imageResizing: true,
    imageHeightShow: true,
    imageAlignShow: true,
    imageMultipleFile: true,
    
    // Настройки видео
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
          
          <button 
            type="button" 
            onClick={() => setShowSeoPanel(!showSeoPanel)}
            className="btn btn-outline"
          >
            🔍 SEO
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
            className="btn btn-outline"
          >
            ⚙️ Дополнительно
          </button>
          
          <button 
            type="button" 
            onClick={() => setShowHistory(!showHistory)}
            className="btn btn-outline"
          >
            📚 История ({history.length})
          </button>
          
          <button 
            type="button" 
            onClick={addToHistory}
            className="btn btn-outline"
          >
            💾 Сохранить версию
          </button>
        </div>
      </div>

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
                }}
                setOptions={editorOptions}
                setContents={htmlContent}
                onChange={setHtmlContent}
                placeholder="Введите содержание новости..."
              />
            </div>
          )}
        </div>
      </div>

      {/* SEO панель */}
      {showSeoPanel && (
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
      )}

      {/* Дополнительные опции */}
      {showAdvancedOptions && (
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
                  {mediaUrls.map((url, index) => (
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
      )}

      {/* История изменений */}
      {showHistory && (
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
      )}

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
