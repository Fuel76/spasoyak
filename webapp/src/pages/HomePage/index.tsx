import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { trpc } from '../../lib/trpc';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';

export const HomePage = () => {
  const { data, error, isLoading, isFetching, isError } = trpc.getNews.useQuery();

  if (isLoading || isFetching) return <span>Loading...</span>;
  if (isError) return <span>Error: {error.message}</span>;

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

  // Заглушки для изречений
  const quotes = [
    "Мудрость начинается с удивления. — Сократ",
    "Счастье — это не что-то готовое. Оно зависит от ваших действий. — Далай-лама",
    "Единственный способ сделать что-то великое — любить то, что ты делаешь. — Стив Джобс",
    "Неудача — это просто возможность начать снова, но уже более мудро. — Генри Форд",
    "Жизнь — это то, что происходит, пока вы строите планы. — Джон Леннон",
  ];

  return (
    <div className="homepage">
      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...sliderSettings}>
          {quotes.map((quote, index) => (
            <div key={index} className="carousel-slide">
              <p>{quote}</p>
            </div>
          ))}
        </Slider>
      </div>

      {/* Новостной блок */}
      <div className="news-block">
        <h1>Новости</h1>
        {data?.news.map((neww) => (
          <div className="news-item" key={neww.id}>
            <h2>{neww.title}</h2>
            <p>{neww.content.slice(0, 200)}...</p>
            {neww.media &&
              (() => {
                try {
                  const media = JSON.parse(neww.media) as string[];
                  return media.map((mediaUrl, index) => (
                    <img key={index} src={`http://localhost:3000/${mediaUrl}`} alt="media" />
                  ));
                } catch (error) {
                  console.error('Ошибка при парсинге media:', error);
                  return null;
                }
              })()}
            <Link to={`/news/${neww.id}`} className="read-more">
              Читать дальше
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};