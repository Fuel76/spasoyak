import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const ViewNewsPage = () => {
  const { neww } = useParams<{ neww: string }>();
  const [news, setNews] = useState<{
    title: string;
    content: string;
    htmlContent: string | null;
    media: string | null;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/api/news/${neww}`);
        if (response.ok) {
          const data = await response.json();
          setNews(data);
        } else {
          setError('Новость не найдена');
        }
      } catch (err) {
        console.error('Ошибка при загрузке новости:', err);
        setError('Ошибка при загрузке новости');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [neww]);

  const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="view-news-page">
      <h1>{news?.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: decodeHtml(news?.htmlContent || '') }} />
      {news?.media &&
        (() => {
          try {
            const media = JSON.parse(news.media) as string[];
            return media.map((mediaUrl, index) => (
              <img key={index} src={`http://localhost:3000${mediaUrl}`} alt="media" />
            ));
          } catch (err) {
            console.error('Ошибка при парсинге media:', err);
            return null;
          }
        })()}
    </div>
  );
};