import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import './NewsEditor.css';
// Правильный импорт типов
import SunEditorCore from 'suneditor/src/lib/core';

interface NewsEditorProps {
  newsId?: number;
}

export const NewsEditor: React.FC<NewsEditorProps> = ({ newsId }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [history, setHistory] = useState<Array<{ title: string; htmlContent: string; timestamp: Date }>>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [customCss, setCustomCss] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Правильная типизация редактора - используем SunEditorCore
  const sunEditorRef = React.useRef<SunEditorCore>(null);

  // Сохранение версии в историю
  const addToHistory = () => {
    setHistory(prev => [{ title, htmlContent, timestamp: new Date() }, ...prev.slice(0, 9)]);
  };
  // Восстановление из истории
  const restoreFromHistory = (index: number) => {
    if (window.confirm('Восстановить эту версию? Текущие изменения будут потеряны.')) {
      const item = history[index];
      setTitle(item.title);
      setHtmlContent(item.htmlContent);
      setShowHistory(false);
    }
  };

  // Загрузка данных новости для редактирования
  useEffect(() => {
    if (newsId) {
      setLoading(true);
      setError(null);
      fetch(`/api/news/${newsId}`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`Ошибка: ${res.status}`);
          }
          return res.json();
        })
        .then(news => {
          setTitle(news.title || '');
          setContent(news.content || '');
          setHtmlContent(news.htmlContent || '');
          setCoverUrl(news.cover || '');
          setCustomCss(news.customCss || ''); // загружаем customCss
          
          // Парсинг медиа-URL
          try {
            let media: string[] = [];
            if (typeof news.media === 'string') {
              media = JSON.parse(news.media);
            } else if (Array.isArray(news.media)) {
              media = news.media;
            }
            setMediaUrls(media);
          } catch (error) {
            console.error('Ошибка при парсинге media:', error);
            setMediaUrls([]);
          }
          
          setLoading(false);
        })
        .catch(err => {
          console.error('Ошибка при загрузке новости:', err);
          setError(`Не удалось загрузить новость: ${err.message}`);
          setLoading(false);
        });
    }
  }, [newsId]);

  // Добавление URL медиа
  const handleAddMediaUrl = () => {
    if (newMediaUrl.trim()) {
      setMediaUrls([...mediaUrls, newMediaUrl.trim()]);
      setNewMediaUrl('');
    }
  };

  // Удаление URL медиа
  const handleRemoveMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
  };

  // Сохранение новости
  const handleSave = async () => {
    if (!title.trim()) {
      alert('Пожалуйста, введите заголовок новости');
      return;
    }

    try {
      const method = newsId ? 'PUT' : 'POST';
      const url = newsId ? `/api/news/${newsId}` : '/api/news';
      
      const newsData = {
        title,
        content,
        htmlContent,
        cover: coverUrl,
        media: JSON.stringify(mediaUrls),
        customCss, // отправляем customCss
        // Если нужны дополнительные поля, например isVisible, добавьте их здесь
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newsData),
      });

      if (response.ok) {
        alert(newsId ? 'Новость успешно обновлена!' : 'Новость успешно создана!');
        // Опционально: редирект на список новостей
        // window.location.href = '/admin/news';
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert('Сетевая ошибка или ошибка сервера.');
    }
  };

  // Добавим функцию для вставки шаблона макета
  const handleInsertLayout = (layoutType: string) => {
    const editor = sunEditorRef.current;
    if (!editor) return;
    let layoutHtml = '';
    switch (layoutType) {
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
      case 'image-left':
        layoutHtml = `
          <div class="layout layout-image-text">
            <div class="image-container">
              <img src="https://placehold.co/400x300" alt="Placeholder" />
              <em class="caption">Подпись к изображению</em>
            </div>
            <div class="text-container">
              <p>Текст рядом с изображением слева...</p>
            </div>
          </div>
        `;
        break;
      case 'image-right':
        layoutHtml = `
          <div class="layout layout-text-image">
            <div class="text-container">
              <p>Текст рядом с изображением справа...</p>
            </div>
            <div class="image-container">
              <img src="https://placehold.co/400x300" alt="Placeholder" />
              <em class="caption">Подпись к изображению</em>
            </div>
          </div>
        `;
        break;
      case 'image-text-wrap':
        layoutHtml = `
          <div class="image-wrap-left">
            <img src="https://placehold.co/300x200" alt="Placeholder" />
            <em class="caption">Подпись к изображению</em>
          </div>
          <p>Текст, который обтекает изображение слева. Добавьте достаточно текста, чтобы увидеть эффект обтекания...</p>
        `;
        break;
      case 'video-text':
        layoutHtml = `
          <div class="layout layout-video-text">
            <div class="video-container">
              <div class="video-embed">
                <!-- Замените на реальный код вставки YouTube/Vimeo -->
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" frameborder="0" allowfullscreen></iframe>
              </div>
            </div>
            <div class="text-container">
              <p>Текст рядом с видео...</p>
            </div>
          </div>
        `;
        break;
      case 'callout':
        layoutHtml = `<div class="callout-block">💡 <strong>Внимание:</strong> Ваш текст здесь...</div>`;
        break;
      case 'alert':
        layoutHtml = `<div class="alert-block">⚠️ <strong>Важно:</strong> Ваше предупреждение...</div>`;
        break;
      case 'button':
        layoutHtml = `<a href="#" class="news-btn">Кнопка</a>`;
        break;
      case 'divider':
        layoutHtml = `<hr class="news-divider" />`;
        break;
      case 'quote':
        layoutHtml = `<blockquote class="news-quote">Цитата или отзыв...</blockquote>`;
        break;
      default:
        return;
    }

    // Вставляем HTML в редактор
    editor.insertHTML(layoutHtml);
  };

  // Расширенная панель инструментов
  const editorOptions = {
    height: '500px',
    buttonList: [
      // Верхняя панель с форматированием текста
      ['undo', 'redo'],
      ['font', 'fontSize', 'formatBlock'],
      ['paragraphStyle', 'blockquote'],
      ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'],
      ['fontColor', 'hiliteColor', 'textStyle', 'align', 'horizontalRule', 'list', 'lineHeight'],
      ['outdent', 'indent'],
      ['table', 'link', 'image', 'video', 'audio', 'codeView', 'fullScreen', 'showBlocks', 'preview', 'template', 'removeFormat'],
    ],
    // Расширенные настройки изображений
    imageGalleryUrl: '/api/images/gallery', // URL для галереи изображений (если нужно)
    imageUploadUrl: '/api/upload-image-from-editor',
    imageAccept: '.jpg, .jpeg, .png, .gif, .bmp, .webp',
    
    // Улучшенные настройки для изображений
    imageFileInput: true, // Разрешить загрузку с компьютера
    imageUrlInput: true, // Разрешить ввод URL
    imageResizing: true, // Разрешить изменение размера
    imageWidth: 'auto', // Начальная ширина (авто)
    imageAlignShow: true, // Показать опции выравнивания
    
    // Улучшенные настройки для видео
    videoResizing: true, 
    videoFileInput: false, // Загрузка видео обычно требует отдельной обработки
    videoUrlInput: true,
    videoRatioShow: true, // Показать настройки соотношения сторон
    
    // Стили по умолчанию
    defaultStyle: 'font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;',
  };

  // Импорт HTML
  const handleHtmlImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setHtmlContent(text);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Экспорт HTML
  const handleExport = () => {
    const fullHtml = `<!DOCTYPE html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"UTF-8\">\n<title>${title}</title>\n<style>${customCss}</style>\n</head>\n<body>\n${htmlContent}\n</body>\n</html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'news'}.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  };

  if (loading) {
    return <div className="loading">Загрузка новости...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="news-editor">
      <h2>{newsId ? 'Редактирование новости' : 'Создание новости'}</h2>
      <div className="news-editor__field">
        <label htmlFor="news-title" style={{ fontWeight: 'bold', display: 'block', marginBottom: 6 }}>Заголовок новости:</label>
        <input
          id="news-title"
          name="news-title"
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="news-editor__input"
          placeholder="Введите заголовок новости"
          style={{ width: '100%', padding: '8px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #d0d0d0', marginBottom: 18 }}
          autoComplete="off"
        />
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button type="button" onClick={() => setPreviewMode((v) => !v)}>
          {previewMode ? 'Редактировать' : 'Предпросмотр'}
        </button>
        <button type="button" onClick={() => setShowHistory((v) => !v)}>
          История изменений ({history.length})
        </button>
        <button type="button" onClick={handleExport}>Экспортировать HTML</button>
        <button type="button" onClick={addToHistory}>Сохранить в историю</button>
        <label style={{ display: 'inline-block' }}>
          <span style={{ cursor: 'pointer', padding: '0 8px' }}>Импорт HTML</span>
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleHtmlImport}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </label>
      </div>
      
      {/* Панель макетов (добавляем над редактором) */}
      <div className="news-editor__layouts">
        <h3>Вставить макет:</h3>
        <div className="news-editor__layouts-buttons">
          <button type="button" onClick={() => handleInsertLayout('two-columns')} title="Две колонки">
            Две колонки
          </button>
          <button type="button" onClick={() => handleInsertLayout('image-left')} title="Изображение слева от текста">
            Изображение + текст
          </button>
          <button type="button" onClick={() => handleInsertLayout('image-right')} title="Изображение справа от текста">
            Текст + изображение
          </button>
          <button type="button" onClick={() => handleInsertLayout('image-text-wrap')} title="Обтекание изображения текстом">
            Обтекание изображения
          </button>
          <button type="button" onClick={() => handleInsertLayout('video-text')} title="Видео + текст">
            Видео + текст
          </button>
          <button type="button" onClick={() => handleInsertLayout('callout')} title="Callout">
            Callout
          </button>
          <button type="button" onClick={() => handleInsertLayout('alert')} title="Alert">
            Alert
          </button>
          <button type="button" onClick={() => handleInsertLayout('button')} title="Кнопка">
            Кнопка
          </button>
          <button type="button" onClick={() => handleInsertLayout('divider')} title="Разделитель">
            Разделитель
          </button>
          <button type="button" onClick={() => handleInsertLayout('quote')} title="Цитата">
            Цитата
          </button>
        </div>
      </div>
      
      {showHistory && (
        <div className="news-editor__history">
          <h3>История изменений</h3>
          {history.length === 0 ? (
            <p>История пуста</p>
          ) : (
            <ul className="history-list">
              {history.map((item, idx) => (
                <li key={idx} className="history-item">
                  <span className="history-time">{item.timestamp.toLocaleString()}</span>
                  <span className="history-title">{item.title}</span>
                  <button className="history-restore-btn" onClick={() => restoreFromHistory(idx)}>
                    Восстановить
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {previewMode ? (
        <div className="news-preview">
          <style dangerouslySetInnerHTML={{ __html: customCss }} />
          <h1>{title}</h1>
          <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
        </div>
      ) : (
        <>
          <SunEditor
            getSunEditorInstance={(sunEditor) => {
              sunEditorRef.current = sunEditor;
            }}
            setOptions={editorOptions}
            setContents={htmlContent}
            onChange={setHtmlContent}
          />
          <div style={{ margin: '16px 0' }}>
            <label style={{ fontWeight: 'bold' }}>CSS для новости:</label>
            <textarea
              value={customCss}
              onChange={e => setCustomCss(e.target.value)}
              rows={5}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 14, marginTop: 4 }}
              placeholder="Введите CSS для оформления этой новости"
            />
          </div>
        </>
      )}

      <textarea
        placeholder="Краткое содержание (текст)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="news-editor__textarea"
      />

      <div className="news-editor__media">
        <label>
          Ссылка на обложку:
          <input
            type="text"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://example.com/cover.jpg"
            className="news-editor__url-input"
          />
        </label>
        {coverUrl && (
          <img src={coverUrl} alt="Превью обложки" className="news-editor__cover-preview" />
        )}
      </div>

      <div className="news-editor__media">
        <label>
          Добавить ссылку на изображение:
          <input
            type="text"
            value={newMediaUrl}
            onChange={(e) => setNewMediaUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="news-editor__url-input"
          />
          <button type="button" onClick={handleAddMediaUrl} className="news-editor__add-btn">
            Добавить
          </button>
        </label>
        
        <ul>
          {mediaUrls.map((url, index) => (
            <li key={index}>
              <img src={url} alt={`media-${index}`} className="news-editor__media-thumb" />
              <span className="news-editor__media-url">{url}</span>
              <button
                type="button"
                onClick={() => handleRemoveMediaUrl(index)}
                className="news-editor__remove-btn"
              >
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="news-editor__actions">
        <button type="button" onClick={handleSave} className="news-editor__save-btn">
          {newsId ? 'Сохранить изменения' : 'Создать новость'}
        </button>
      </div>
    </div>
  );
};