import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

interface NewsEditorProps {
  newsId?: number; // Если передан `newsId`, значит редактируем новость
}

export const NewsEditor: React.FC<NewsEditorProps> = ({ newsId }) => {
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (newsId) {
      // Загрузка данных новости для редактирования
      fetch(`http://localhost:3000/api/news/${newsId}`)
        .then((response) => response.json())
        .then((data) => {
          setTitle(data.title);
          setContent(data.content);
        })
        .catch((error) => console.error('Ошибка при загрузке новости:', error));
    }
  }, [newsId]);

  const handleSave = async () => {
    try {
      const url = newsId
        ? `http://localhost:3000/api/news/edit/${newsId}`
        : 'http://localhost:3000/api/news/add';

      const method = newsId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (response.ok) {
        alert(newsId ? 'Новость успешно обновлена!' : 'Новость успешно добавлена!');
      } else {
        alert('Ошибка при сохранении новости.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при сохранении новости.');
    }
  };

  return (
    <div>
      <h2>{newsId ? 'Редактирование новости' : 'Добавление новости'}</h2>
      <input
        type="text"
        placeholder="Заголовок новости"
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
        onChange={(content) => setContent(content)}
        setContents={content}
      />
      <button onClick={handleSave} style={{ marginTop: '20px' }}>
        {newsId ? 'Сохранить изменения' : 'Добавить новость'}
      </button>
    </div>
  );
};