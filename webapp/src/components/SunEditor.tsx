import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

interface SunEditorComponentProps {
  pageId?: number;
}

export const SunEditorComponent: React.FC<SunEditorComponentProps> = ({ pageId }) => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');

  useEffect(() => {
    if (pageId) {
      // Загрузка данных страницы для редактирования
      const fetchPage = async () => {
        try {
          const response = await fetch(`http://localhost:3000/api/pages/${pageId}`);
          if (response.ok) {
            const page = await response.json();
            setTitle(page.title);
            setSlug(page.slug);
            setContent(page.content);
          } else {
            console.error('Ошибка при загрузке страницы');
          }
        } catch (error) {
          console.error('Ошибка при загрузке страницы:', error);
        }
      };

      fetchPage();
    }
  }, [pageId]);

  const handleSave = async () => {
    if (!title || !slug || !content) {
      alert('Все поля обязательны для заполнения');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/pages/${pageId || ''}`, {
        method: pageId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, slug, content }),
      });

      if (response.ok) {
        alert('Страница успешно сохранена!');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Ошибка при сохранении страницы.');
      }
    } catch (error) {
      console.error('Ошибка при сохранении страницы:', error);
      alert('Ошибка при сохранении страницы.');
    }
  };

  return (
    <div>
      <h2>{pageId ? 'Редактирование страницы' : 'Создание страницы'}</h2>
      <input
        type="text"
        placeholder="Заголовок страницы"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <input
        type="text"
        placeholder="Slug страницы (например, about-us)"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
      />
      <SunEditor
        setOptions={{
          height: '300px',
          buttonList: [
            ['undo', 'redo'],
            ['bold', 'italic', 'underline', 'strike'],
            ['list', 'align', 'font', 'fontSize', 'formatBlock'],
            ['link', 'image', 'video', 'table'], // Включаем кнопку для добавления изображений
            ['removeFormat'],
          ],
          imageFileInput: true, // Включаем загрузку файлов
          imageUrlInput: true, // Включаем вставку изображений по URL
        }}
        onChange={(content) => setContent(content)} // Сохраняем HTML-контент
        defaultValue={content}
      />
      <button onClick={handleSave} style={{ marginTop: '20px' }}>
        Сохранить
      </button>
    </div>
  );
};