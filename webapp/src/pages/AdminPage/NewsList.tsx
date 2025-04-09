import React, { useEffect, useState } from 'react';

interface News {
  id: number;
  title: string;
  createdAt: string;
}

export const NewsList = () => {
  const [news, setNews] = useState<News[]>([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/news');
        const data = await response.json();
        setNews(data);
      } catch (error) {
        console.error('Ошибка при загрузке новостей:', error);
      }
    };

    fetchNews();
  }, []);

  return (
    <div>
      <h1>Список новостей</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Название</th>
            <th>Дата создания</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.title}</td>
              <td>{new Date(item.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};