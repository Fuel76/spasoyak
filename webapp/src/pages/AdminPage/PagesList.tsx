import { useEffect, useState } from 'react';

interface Page {
  id: number;
  title: string;
  slug: string;
  createdAt: string;
}

export const PagesList = () => {
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/pages');
        const data = await response.json();
        setPages(data);
      } catch (error) {
        console.error('Ошибка при загрузке страниц:', error);
      }
    };

    fetchPages();
  }, []);

  return (
    <div>
      <h1>Список страниц</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Slug</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {pages.map((page) => (
            <tr key={page.id}>
              <td>{page.id}</td>
              <td>{page.title}</td>
              <td>{page.slug}</td>
              <td>{new Date(page.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};