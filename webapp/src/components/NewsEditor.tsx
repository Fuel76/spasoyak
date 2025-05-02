import React, { useState, useEffect, ChangeEvent } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

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

  useEffect(() => {
    if (newsId) {
      fetch(`http://localhost:3000/api/news/${newsId}`)
        .then(res => res.json())
        .then(news => {
          setTitle(news.title);
          setContent(news.content);
          setHtmlContent(news.htmlContent || '');
          setCoverUrl(news.cover || '');
          try {
            setMediaUrls(JSON.parse(news.media || '[]'));
          } catch {
            setMediaUrls([]);
          }
        });
    }
  }, [newsId]);

  const handleAddMediaUrl = () => {
    if (newMediaUrl && !mediaUrls.includes(newMediaUrl)) {
      setMediaUrls((prev) => [...prev, newMediaUrl]);
      setNewMediaUrl('');
    }
  };

  const handleRemoveMediaUrl = (urlToRemove: string) => {
    setMediaUrls((prev) => prev.filter(url => url !== urlToRemove));
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert('Заголовок и содержание обязательны');
      return;
    }

    const body = JSON.stringify({
      title,
      content,
      htmlContent,
      coverUrl: coverUrl || null,
      mediaUrls,
    });

    const method = newsId ? 'PUT' : 'POST';
    const url = `http://localhost:3000/api/news/${newsId || ''}`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (response.ok) {
        alert('Новость успешно сохранена!');
      } else {
        const errorData = await response.json();
        alert(`Ошибка: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error("Ошибка при сохранении:", error);
      alert('Сетевая ошибка или ошибка сервера.');
    }
  };

  return (
    <div className="news-editor">
      <h2>{newsId ? 'Редактирование новости' : 'Создание новости'}</h2>
      <input
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="news-editor__input"
      />
      <SunEditor
        setOptions={{
          height: '500px',
          buttonList: [
            ['undo', 'redo'],
            ['font', 'fontSize', 'formatBlock'],
            ['paragraphStyle', 'blockquote'],
            ['bold', 'italic', 'underline', 'strike', 'subscript', 'superscript'],
            ['fontColor', 'hiliteColor', 'textStyle'],
            ['removeFormat'],
            ['outdent', 'indent'],
            ['align', 'horizontalRule', 'list', 'lineHeight'],
            ['table', 'link', 'image', 'video'],
            ['fullScreen', 'showBlocks', 'codeView'],
          ],
          imageUploadUrl: '/api/upload-image-from-editor',
          imageAccept: '.jpg, .jpeg, .png, .gif, .bmp',
        }}
        onChange={setHtmlContent}
        defaultValue={htmlContent}
        setDefaultStyle="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;"
      />
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
        <ul className="news-editor__media-list">
          {mediaUrls.map((url, index) => (
            <li key={index}>
              <img src={url} alt={`media-${index}`} className="news-editor__media-preview" />
              <span>{url.length > 40 ? url.slice(0, 40) + '...' : url}</span>
              <button type="button" onClick={() => handleRemoveMediaUrl(url)} className="news-editor__remove-btn">
                Удалить
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleSave} className="news-editor__save-btn">
        Сохранить
      </button>
    </div>
  );
};