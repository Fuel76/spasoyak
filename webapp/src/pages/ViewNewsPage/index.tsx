import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export const ViewNewsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<{
    title: string;
    content: string;
    htmlContent: string | null;
    media: string | null;
    cover: string | null;
    customCss?: string | null;
    coverImage?: string | null;
    headerStyle?: string;
    headerColor?: string;
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:3000/api/news/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNews({
            ...data,
            coverImage: data.cover || data.coverImage,
            headerStyle: data.headerStyle || 'default',
            headerColor: data.headerColor || '#f8f9fa',
          });
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
  }, [id]);

  const decodeHtml = (html: string): string => {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>{error}</p>;
  if (!news) return <p>Новость не найдена.</p>;

  const coverUrl = news.cover;

  return (
    <div className="view-news-page">
      {/* Контейнер для "липкой" обложки */}
      {coverUrl && (
        <div className="news-cover-sticky-container">
          <div className="news-cover-full">
            <img src={coverUrl} alt={news.title} />
            {/* Можно добавить градиент для плавного перехода */}
            <div className="news-cover-gradient"></div>
          </div>
        </div>
      )}

      {/* Контейнер для контента, который будет скроллиться поверх обложки */}
      <div className="news-content-scrollable">
        <h1>{news.title}</h1>
        {/* Вставляем customCss, если есть */}
        {news.customCss && (
          <style dangerouslySetInnerHTML={{ __html: news.customCss }} />
        )}
        {/* Отображаем HTML контент с форматированием */}
        <div className="formatted-content" dangerouslySetInnerHTML={{ __html: decodeHtml(news.htmlContent || '') }} />

        {/* Отображаем медиа */}
        {news.media &&
          (() => {
            try {
              const media = JSON.parse(news.media) as string[];
              return (
                <div className="news-media-gallery">
                  {media.map((mediaUrl, index) => (
                    <img key={index} src={mediaUrl} alt={`media-${index}`} />
                  ))}
                </div>
              );
            } catch (err) {
              console.error('Ошибка при парсинге media:', err);
              return null;
            }
          })()}
      </div>
    </div>
  );
};