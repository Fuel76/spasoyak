import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Slider from 'react-slick';
import { useState, useEffect } from 'react';
import NewsPage from '../NewsPage';

export const HomePage = () => {
  const [carouselImages, setCarouselImages] = useState<{ id: number; url: string }[]>([]);

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

  // Настройки для карусели
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: true
  };

  return (
    <div className="homepage">
      {/* Карусель */}
      <div className="carousel-container">
        <Slider {...sliderSettings}>
          {carouselImages.map((image) => (
            <div key={image.id + '-' + image.url} className="carousel-slide">
              <img src={image.url} alt="carousel" />
            </div>
          ))}
        </Slider>
      </div>

      {/* Встроенная страница новостей */}
      <div className="embedded-news-section">
        <NewsPage />
      </div>
    </div>
  );
};