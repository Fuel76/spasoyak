import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

interface NewsEditorProps {
  newsId?: number;
}

export const NewsEditor: React.FC<NewsEditorProps> = ({ newsId }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [media, setMedia] = useState<string>('');

  useEffect(() => {
    if (newsId) {
      // Загрузка данных новости для редактирования
      const fetchNews = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/news/${newsId}`);
          if (response.ok) {
            const news = await response.json();
            setTitle(news.title);
            setContent(news.content);
            setHtmlContent(news.htmlContent || '');
            setMedia(news.media || '');
          } else {
            console.error('Ошибка при загрузке новости');
          }
        } catch (error) {
          console.error('Ошибка при загрузке новости:', error);
        }
      };

      fetchNews();
    }
  }, [newsId]);

  const handleSave = async () => {
    if (!title || !content) {
      alert('Заголовок и содержание обязательны');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/news/${newsId || ''}`, {
        method: newsId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, htmlContent }),
      });

      if (response.ok) {
        alert('Новость успешно сохранена!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при сохранении новости.');
      }
    } catch (error) {
      console.error('Ошибка при сохранении новости:', error);
      alert('Ошибка при сохранении новости.');
    }
  };

  return (
    <div>
      <h2>{newsId ? 'Редактирование новости' : 'Создание новости'}</h2>
      <input
        type="text"
        placeholder="Заголовок"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <SunEditor
        setOptions={{
          height: '300px',
          buttonList: [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike'],
            ['list', 'align', 'font', 'fontSize', 'formatBlock'],
            ['link', 'image', 'video', 'table'],
            ['removeFormat'],
          ],
        }}
        onChange={(content) => setHtmlContent(content)}
        defaultValue={htmlContent}
      />
      <textarea
        placeholder="Краткое содержание"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        style={{ width: '100%', marginTop: '10px', padding: '8px', height: '100px' }}
      />
      {newsId && (
        <div>
          <h3>Медиа-файлы:</h3>
          {Array.isArray(JSON.parse(media)) &&
            JSON.parse(media).map((mediaUrl: string, index: number) => (
              <img key={index} src={`http://localhost:3000${mediaUrl}`} alt="media" />
            ))}
        </div>
      )}
      <button onClick={handleSave} style={{ marginTop: '20px' }}>
        Сохранить
      </button>
    </div>
  );
};