import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

export const HomePage = () => {
  // Заменяем trpc на обычное состояние и fetch
  interface NewsItem {
    id: number;
    title: string;
    cover: string;
    media: string | string[];
    htmlContent: string;
  }

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [carouselImages, setCarouselImages] = useState<{ id: number; url: string }[]>([]);
  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Загрузка новостей
  useEffect(() => {
    setIsLoading(true);
    fetch(`http://localhost:3000/api/news/public?page=${page}&limit=${PAGE_SIZE}`)
      .then(res => res.json())
      .then(data => {
        setNews(data.news); // Получаем news из объекта { news: [...] }
        setHasMore(data.news.length === PAGE_SIZE);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Ошибка при загрузке новостей:', err);
        setError(err);
        setIsLoading(false);
      });
  }, [page]);

  // Загрузка картинок для карусели
  useEffect(() => {
    fetch('http://localhost:3000/api/carousel')
      .then((res) => res.json())
      .then((data) => {
        const uniqueImages = data.filter(
          (img: { id: number; url: string }, idx: number, arr: any[]) =>
            arr.findIndex((el) => el.url === img.url) === idx
        );
        setCarouselImages(uniqueImages);
      })
      .catch((error) => console.error('Ошибка при загрузке изображений карусели:', error));
  }, []);

  if (isLoading) return <span>Loading...</span>;
  if (error) return <span>Error: {error}</span>;

  // Настройки для карусели
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="homepage">
      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...sliderSettings}>
          {carouselImages.map((image) => (
            <div key={image.id} className="carousel-slide">
              <img src={image.url} alt="carousel" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Новостной блок */}
      <div className="news-block">
        <div className="container mt-5">
          <div className="row">
            {news.length > 0 ? (
              news.map((neww) => {
                const coverUrl = neww.cover;
                let mediaUrls: string[] = [];
                try {
                  if (typeof neww.media === 'string') {
                    mediaUrls = JSON.parse(neww.media);
                  } else if (Array.isArray(neww.media)) {
                    mediaUrls = neww.media;
                  }
                } catch (e) {
                  console.error("Ошибка парсинга media:", e, neww.media);
                  mediaUrls = [];
                }

                const decodeHtml = (html: string): string => {
                  const txt = document.createElement('textarea');
                  txt.innerHTML = html;
                  return txt.value;
                };

                const previewHtml = neww.htmlContent || '';

                return (
                  <div className="col-12 col-md-6 col-lg-4" key={neww.id}>
                    <article className="news-card">
                      {coverUrl && (
                        <div className="news-card__cover">
                          <img src={coverUrl} alt={neww.title} />
                        </div>
                      )}
                      <div className="news-card__body">
                        <h5 className="news-card__title">{neww.title}</h5>
                        <div
                          className="news-card__preview-content formatted-content"
                          dangerouslySetInnerHTML={{ __html: decodeHtml(previewHtml) }}
                        />
                        <div className="news-card__media">
                          {mediaUrls.map((url, index) => (
                            <img key={index} src={url} alt={`media-${index}`} className="news-card__media-thumb" />
                          ))}
                        </div>
                        <a href={`/news/${neww.id}`} className="news-card__more">
                          Читать дальше
                        </a>
                      </div>
                    </article>
                  </div>
                );
              })
            ) : (
              <div className="col-12 text-center">
                <p>Новостей пока нет</p>
              </div>
            )}
          </div>
          {/* Пагинация */}
          <div style={{ display: 'flex', justifyContent: 'center', margin: '2rem 0 0 0' }}>
            <button
              className="button"
              style={{ minWidth: 180, opacity: hasMore ? 1 : 0.5 }}
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
            >
              Следующая страница
            </button>
            {page > 1 && (
              <button
                className="button"
                style={{ minWidth: 180, marginLeft: 16 }}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Предыдущая страница
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};