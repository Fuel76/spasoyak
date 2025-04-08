import { trpc } from '../../lib/trpc';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

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

  return (
    <div className="homepage">
      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...sliderSettings}>
          {data?.news?.slice(0, 5).map((neww) => (
            <div key={neww.id} className="carousel-slide">
              <h2>{neww.title}</h2>
              <p>{neww.content.slice(0, 100)}...</p>
            </div>
          ))}
        </Slider>
      </div>

      {/* Новостной блок */}
      <div className="news-block">
        <h1>Новости</h1>
        {data?.news.map((neww) => (
          <div key={neww.id} className="news-item">
            <h2>{neww.title}</h2>
            <p>{neww.content.slice(0, 200)}...</p>
          </div>
        ))}
      </div>
    </div>
  );
};