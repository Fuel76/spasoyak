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
  const [error, setError] = useState<string | null>(null);
  const [metaDescription, setMetaDescription] = useState<string>('');
  const [metaKeywords, setMetaKeywords] = useState<string>('');
  const [customCss, setCustomCss] = useState<string>('');
  
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
      const cssText = await file.text();
      
      // Если уже есть CSS, спрашиваем подтверждение
      if (customCss && !window.confirm('Заменить текущие стили?')) {
        return;
      }
      
      setCustomCss(cssText);
    } catch (err) {
      alert('Ошибка при импорте CSS файла');
      console.error(err);
    }
    
    if (cssInputRef.current) {
      cssInputRef.current.value = '';
    }
  };

  // Сохранение версии в историю
  const addToHistory = () => {
    const newHistoryItem = {
      title,
      content,
      timestamp: new Date()
    };
    
    setHistory(prevHistory => [newHistoryItem, ...prevHistory.slice(0, 9)]); // Храним до 10 версий
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
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="page-editor">
      <div className="page-editor__toolbar">
        <div className="page-editor__basic-tools">
          <button onClick={handleSave} disabled={loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
          
          <button onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? 'Редактор' : 'Предпросмотр'}
          </button>
          
          <button onClick={handleExport}>
            Экспортировать HTML
          </button>
          
          <button onClick={() => setShowHistory(!showHistory)}>
            История изменений ({history.length})
          </button>
          
          <button onClick={() => setShowCssEditor(!showCssEditor)}>
            {showCssEditor ? 'Скрыть CSS' : 'Показать CSS'}
          </button>
          
          <button onClick={() => setShowHtmlView(!showHtmlView)}>
            {showHtmlView ? 'Визуальный редактор' : 'HTML редактор'}
          </button>
        </div>
        
        <div className="page-editor__import-tools">
          <label className="file-import-label">
            Импорт HTML
            <input
              type="file"
              accept=".html,.htm"
              onChange={handleHtmlImport}
              ref={htmlInputRef}
              className="file-input"
            />
          </label>
          
          <label className="file-import-label">
            Импорт CSS
            <input
              type="file"
              accept=".css"
              onChange={handleCssImport}
              ref={cssInputRef}
              className="file-input"
            />
          </label>
        </div>
      </div>

      <div className="page-editor__main">
        {previewMode ? (
          <div className="page-preview">
            <style dangerouslySetInnerHTML={{ __html: customCss }} />
            <h1>{title}</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        ) : (
          <>
            <div className="page-editor__form">
              <div className="form-group">
                <label htmlFor="title">Заголовок страницы</label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-control"
                  placeholder="Введите заголовок страницы"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="slug">URL страницы (slug)</label>
                <input
                  type="text"
                  id="slug"
                  value={pageSlug}
                  onChange={(e) => setPageSlug(e.target.value)}
                  className="form-control"
                  placeholder="например: about-us, contacts"
                />
              </div>
              
              <div className="form-group">
                <label>Мета-теги для SEO</label>
                <input
                  type="text"
                  placeholder="Meta Description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  className="form-control"
                />
                <input
                  type="text"
                  placeholder="Meta Keywords"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="form-control"
                  style={{ marginTop: '10px' }}
                />
              </div>
            </div>
            
            {showCssEditor && (
              <div className="page-editor__css">
                <h3>CSS стили страницы</h3>
                <textarea
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                  className="page-editor__css-textarea"
                  rows={10}
                  placeholder="Введите CSS стили для страницы"
                />
              </div>
            )}
            
            {showHistory && (
              <div className="page-editor__history">
                <h3>История изменений</h3>
                {history.length === 0 ? (
                  <p>История изменений пуста</p>
                ) : (
                  <ul className="history-list">
                    {history.map((item, index) => (
                      <li key={index} className="history-item">
                        <span className="history-time">
                          {item.timestamp.toLocaleString()}
                        </span>
                        <span className="history-title">{item.title}</span>
                        <button 
                          className="history-restore-btn"
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

            <div className="page-editor__layouts">
              <h3>Вставить макет:</h3>
              <div className="page-editor__layouts-buttons">
                <button onClick={() => handleInsertLayout('hero')}>Герой-секция</button>
                <button onClick={() => handleInsertLayout('features')}>Блок преимуществ</button>
                <button onClick={() => handleInsertLayout('two-columns')}>Две колонки</button>
                <button onClick={() => handleInsertLayout('image-text')}>Изображение + текст</button>
              </div>
            </div>

            {showHtmlView ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="page-editor__html-textarea"
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
          </>
        )}
      </div>
    </div>
  );
};