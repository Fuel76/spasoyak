import React, { useState, useEffect, useRef } from 'react';
import SunEditor from 'suneditor-react';
import SunEditorCore from 'suneditor/src/lib/core';
import 'suneditor/dist/css/suneditor.min.css';
import './PageEditor.css';

interface PageEditorProps {
  pageId?: number;
  slug?: string;
  navigate?: (path: string) => void; // добавлено
}

export const PageEditor: React.FC<PageEditorProps> = ({ pageId, slug, navigate }) => {
  const [title, setTitle] = useState<string>('');
  const [pageSlug, setPageSlug] = useState<string>(slug || '');
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');
  const [customCss, setCustomCss] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для управления видом редактора
  const [showCssEditor, setShowCssEditor] = useState<boolean>(false);
  const [showHtmlView, setShowHtmlView] = useState<boolean>(false);
  const [previewMode, setPreviewMode] = useState<boolean>(false);
  
  // История изменений
  const [history, setHistory] = useState<Array<{
    title: string;
    content: string;
    timestamp: Date;
  }>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  
  const sunEditorRef = useRef<SunEditorCore | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cssInputRef = useRef<HTMLInputElement>(null);
  const htmlInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (pageId || slug) {
      loadPageData();
    }
  }, [pageId, slug]);

  // Загружаем данные страницы
  const loadPageData = async () => {
    setLoading(true);
    try {
      let url = '/api/pages';
      if (pageId) {
        url += `/${pageId}`;
      } else if (slug) {
        url += `/by-slug/${slug}`;
      }
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      if (!response.ok) {
        let errorText = 'Ошибка загрузки страницы';
        if (contentType && contentType.includes('application/json')) {
          const errJson = await response.json();
          errorText = errJson.error || errorText;
        } else {
          errorText = await response.text();
        }
        setError(errorText);
        return;
      }
      if (!contentType || !contentType.includes('application/json')) {
        setError('Некорректный ответ сервера (ожидался JSON)');
        return;
      }
      const pageData = await response.json();
      setTitle(pageData.title || '');
      setPageSlug(pageData.slug || '');
      setContent(pageData.content || '');
      setCustomCss(pageData.customCss || '');
      setMetaDescription(pageData.metaDescription || '');
      setMetaKeywords(pageData.metaKeywords || '');
      // Загружаем историю изменений, если доступна
      if (pageData.history && Array.isArray(pageData.history)) {
        setHistory(pageData.history.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      }
    } catch (err) {
      setError('Ошибка загрузки страницы');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Импорт HTML файла
  const handleHtmlImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      // Читаем содержимое файла
      const text = await file.text();
      
      // Если в редакторе уже есть контент, спрашиваем подтверждение
      if (content && !window.confirm('Заменить текущий контент?')) {
        return;
      }
      
      // Устанавливаем HTML в редактор
      setContent(text);
      
      // Если в имени файла есть название, используем его для заголовка
      if (!title && file.name) {
        const fileName = file.name.replace(/\.html?$/i, '');
        setTitle(fileName);
      }
    } catch (err) {
      alert('Ошибка при импорте HTML файла');
      console.error(err);
    }
    
    // Очищаем input, чтобы можно было загрузить тот же файл повторно
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Импорт CSS файла
  const handleCssImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      setCustomCss(text);
      alert('CSS файл успешно импортирован');
    } catch (err) {
      alert('Ошибка при импорте CSS файла');
      console.error(err);
    }
  };

  // Восстановление из истории
  const restoreFromHistory = (index: number) => {
    if (window.confirm('Восстановить эту версию? Текущие изменения будут потеряны.')) {
      const item = history[index];
      setTitle(item.title);
      setContent(item.content);
      setShowHistory(false);
    }
  };

  // Вставка шаблона макета
  const handleInsertLayout = (layoutType: string) => {
    const editor = sunEditorRef.current;
    if (!editor) return;

    let layoutHtml = '';
    switch (layoutType) {
      case 'hero':
        layoutHtml = `
          <div class="hero-section">
            <div class="hero-content">
              <h1>Заголовок секции</h1>
              <p>Описание или призыв к действию</p>
              <a href="#" class="cta-button">Кнопка</a>
            </div>
            <div class="hero-image">
              <img src="https://placehold.co/600x400" alt="Hero Image">
            </div>
          </div>
        `;
        break;
        
      case 'features':
        layoutHtml = `
          <div class="features-section">
            <h2>Наши преимущества</h2>
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">🔍</div>
                <h3>Первое преимущество</h3>
                <p>Описание первого преимущества</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🚀</div>
                <h3>Второе преимущество</h3>
                <p>Описание второго преимущества</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🛡️</div>
                <h3>Третье преимущество</h3>
                <p>Описание третьего преимущества</p>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'two-columns':
        layoutHtml = `
          <div class="layout layout-two-columns">
            <div class="column">
              <p>Текст первой колонки...</p>
            </div>
            <div class="column">
              <p>Текст второй колонки...</p>
            </div>
          </div>
        `;
        break;
        
      case 'image-text':
        layoutHtml = `
          <div class="layout layout-image-text">
            <div class="image-container">
              <img src="https://placehold.co/400x300" alt="Placeholder" />
              <em class="caption">Подпись к изображению</em>
            </div>
            <div class="text-container">
              <p>Текст рядом с изображением...</p>
            </div>
          </div>
        `;
        break;
    }

    // Вставляем HTML в редактор
    editor.insertHTML(layoutHtml);
  };

  // Сохранение страницы
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите заголовок страницы');
      return;
    }

    try {
      setLoading(true);
      
      // Формируем данные страницы
      const pageData = {
        title,
        slug: pageSlug,
        content: content, // Явно передаём контент
        customCss,
        metaDescription,
        metaKeywords,
        history
      };
      
      // Определяем метод и URL в зависимости от того, создаём или редактируем
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const method = pageId ? 'PUT' : 'POST';
      const url = pageId ? `${API_URL}/api/pages/${pageId}` : `${API_URL}/api/pages`;
      // Получаем токен из localStorage
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(pageData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Ошибка сохранения страницы');
      }

      if (!pageId && navigate) {
        // Если это создание, делаем редирект на редактирование по id
        const created = await response.json();
        navigate(`/admin/pages/edit/${created.id}`);
        return;
      }
      // После успешного редактирования — обновить данные из базы
      await loadPageData();
      alert('Страница успешно сохранена!');
      
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      alert(`Ошибка при сохранении: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setLoading(false);
    }
  };

  // Экспорт страницы как HTML
  const handleExport = () => {
    // Создаём полный HTML документ
    const fullHtml = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${metaDescription}">
    <meta name="keywords" content="${metaKeywords}">
    <title>${title}</title>
    <style>
        ${customCss}
    </style>
</head>
<body>
    ${content}
</body>
</html>
    `.trim();
    
    // Создаём blob и ссылку для скачивания
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageSlug || title.replace(/\s+/g, '-').toLowerCase()}.html`;
    document.body.appendChild(a);
    a.click();
    
    // Очистка
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  // Настройки для SunEditor
  const editorOptions = {
    height: '500px',
    buttonList: [
      ['undo', 'redo', 'font', 'fontSize', 'formatBlock'],
      ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
      ['removeFormat', 'fontColor', 'hiliteColor'],
      ['outdent', 'indent', 'align', 'list', 'horizontalRule'],
      ['table', 'link', 'image', 'video'],
      ['fullScreen', 'codeView', 'preview'],
    ],
    // Настройки изображений
    imageUploadUrl: '/api/upload/upload-image-from-editor',
    imageAccept: '.jpg, .jpeg, .png, .gif, .webp',
    imageFileInput: true,
    imageUrlInput: true,
    imageResizing: true,
  };

  if (loading && !content) {
    return (
      <div className="system-page-container">
        <div className="system-page-content">
          <div className="system-alert system-alert-info">Загрузка...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">
          {pageId ? 'Редактирование страницы' : 'Создание страницы'}
        </h1>
        
        <div className="system-content-card">
          <div className="system-toolbar">
            <button onClick={handleSave} disabled={loading} className="system-btn-primary">
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
            
            <button onClick={() => setPreviewMode(!previewMode)} className="system-btn-secondary">
              {previewMode ? 'Редактор' : 'Предпросмотр'}
            </button>
            
            <button onClick={handleExport} className="system-btn-secondary">
              Экспортировать HTML
            </button>
            
            <button onClick={() => setShowHistory(!showHistory)} className="system-btn-secondary">
              История изменений ({history.length})
            </button>
            
            <button onClick={() => setShowCssEditor(!showCssEditor)} className="system-btn-secondary">
              {showCssEditor ? 'Скрыть CSS' : 'Показать CSS'}
            </button>
            
            <button onClick={() => setShowHtmlView(!showHtmlView)} className="system-btn-secondary">
              {showHtmlView ? 'Визуальный редактор' : 'HTML редактор'}
            </button>
            
            <label className="system-btn-outline" style={{ cursor: 'pointer' }}>
              Импорт HTML
              <input
                type="file"
                accept=".html,.htm"
                onChange={handleHtmlImport}
                ref={htmlInputRef}
                style={{ display: 'none' }}
              />
            </label>
            
            <label className="system-btn-outline" style={{ cursor: 'pointer' }}>
              Импорт CSS
              <input
                type="file"
                accept=".css"
                onChange={handleCssImport}
                ref={cssInputRef}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          {previewMode ? (
            <div className="system-content-card">
              <h3 className="system-form-label">Предпросмотр</h3>
              <div className="page-preview">
                <style dangerouslySetInnerHTML={{ __html: customCss }} />
                <h1>{title}</h1>
                <div dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          ) : (
            <>
              <div className="system-content-card">
                <div className="system-form-group">
                  <label htmlFor="title" className="system-form-label">Заголовок страницы</label>
                  <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="system-form-input"
                  placeholder="Введите заголовок страницы"
                />
              </div>
              
              <div className="system-form-group">
                <label htmlFor="slug" className="system-form-label">URL страницы (slug)</label>
                <input
                  type="text"
                  id="slug"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  className="system-form-input"
                  placeholder="например: about-us, contacts"
                />
              </div>
              
              <div className="system-form-group">
                <label className="system-form-label">Мета-теги для SEO</label>
                <input
                  type="text"
                  placeholder="Meta Description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="system-form-input"
                />
                <input
                  type="text"
                  placeholder="Meta Keywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="system-form-input"
                  style={{ marginTop: '10px' }}
                />
              </div>
            </div>
            
            {showCssEditor && (
              <div className="system-content-card">
                <h3 className="system-form-label">CSS стили страницы</h3>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  className="system-form-textarea"
                  rows={10}
                  placeholder="Введите CSS стили для страницы"
                />
              </div>
            )}
            
            {showHistory && (
              <div className="system-content-card">
                <h3 className="system-form-label">История изменений</h3>
                {history.length === 0 ? (
                  <p>История изменений пуста</p>
                ) : (
                  <ul className="system-list">
                    {history.map((item, index) => (
                      <li key={index} className="system-list-item">
                        <span className="system-text-muted">
                          {item.timestamp.toLocaleString()}
                        </span>
                        <span className="system-flex-1">{item.title}</span>
                        <button 
                          className="system-btn-link"
                          onClick={() => restoreFromHistory(index)}
                        >
                          Восстановить
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="system-content-card">
              <h3 className="system-form-label">Вставить макет:</h3>
              <div className="system-toolbar">
                <button onClick={() => handleInsertLayout('hero')} className="system-btn-outline">Герой-секция</button>
                <button onClick={() => handleInsertLayout('features')} className="system-btn-outline">Блок преимуществ</button>
                <button onClick={() => handleInsertLayout('two-columns')} className="system-btn-outline">Две колонки</button>
                <button onClick={() => handleInsertLayout('image-text')} className="system-btn-outline">Изображение + текст</button>
              </div>
            </div>

            <div className="system-content-card">
              {showHtmlView ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="system-form-textarea"
                  rows={20}
                  placeholder="Введите HTML код страницы"
                />
              ) : (
                <SunEditor
                  getSunEditorInstance={(editor) => {
                    sunEditorRef.current = editor;
                  }}
                  setOptions={editorOptions}
                  setContents={content}
                  onChange={setContent}
                />
              )}
            </div>
          </>
        )}

        {error && <div className="system-alert system-alert-error">{error}</div>}
        </div>
      </div>
    </div>
  );
};