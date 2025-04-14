import React, { useEffect, useState } from 'react';

interface News {
  id: number;
  title: string;
  htmlContent: string;
  media: string[];
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
      {news.map((item) => (
        <div key={item.id} className="news-item">
          <h2>{item.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: item.htmlContent }} />
          {item.media.map((url, index) => (
            <img key={index} src={url} alt={`media-${index}`} />
          ))}
          <p>Дата создания: {new Date(item.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};