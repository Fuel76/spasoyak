import React, { useState, useEffect, useRef } from 'react';
import SunEditor from 'suneditor-react';
import SunEditorCore from 'suneditor/src/lib/core';
import 'suneditor/dist/css/suneditor.min.css';

interface SunEditorComponentProps {
  pageId?: number;
}

export const SunEditorComponent: React.FC<SunEditorComponentProps> = ({ pageId }) => {
  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const sunEditorRef = useRef<SunEditorCore | null>(null);

  const editorOptions = {
    height: '300px',
    buttonList: [
      ['undo', 'redo'],
      ['bold', 'italic', 'underline', 'strike'],
      ['list', 'align', 'font', 'fontSize', 'formatBlock'],
      ['link', 'image', 'video', 'table'],
      ['removeFormat'],
    ],
    imageFileInput: true,
    imageUrlInput: true,
  };

  useEffect(() => {
    if (pageId) {
      // Загрузка данных страницы для редактирования
      const fetchPage = async () => {
        try {
          const response = await fetch(`/api/pages/${pageId}`);
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
      const response = await fetch(`/api/pages/${pageId || ''}`, {
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
        getSunEditorInstance={(sunEditor: SunEditorCore) => {
          sunEditorRef.current = sunEditor;
        }}
        setOptions={editorOptions}
        setContents={content}
        onChange={setContent}
      />
      <button onClick={handleSave} style={{ marginTop: '20px' }}>
        Сохранить
      </button>
    </div>
  );
};