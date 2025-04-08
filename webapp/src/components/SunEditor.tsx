import React, { useState } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

export const SunEditorComponent = () => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');

  const handleEditorChange = (content: string) => {
    setContent(content);
  };

  const handleSave = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/save-page', { // Убедитесь, что URL правильный
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, slug, content }),
      });

      if (response.ok) {
        alert('Страница успешно создана!');
      } else {
        alert('Ошибка при создании страницы.');
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Ошибка при создании страницы.');
    }
  };

  return (
    <div>
      <h2>Создание новой страницы</h2>
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
            ['link', 'image', 'video', 'table'],
            ['removeFormat'],
          ],
        }}
        onChange={handleEditorChange}
      />
      <button onClick={handleSave} style={{ marginTop: '20px' }}>
        Сохранить
      </button>
    </div>
  );
};