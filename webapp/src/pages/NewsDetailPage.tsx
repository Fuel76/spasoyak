import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import NewsHeader from '../components/NewsHeader';
import './NewsDetailPage.css';

interface Category {
  id: string;
  name: string;
  color?: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
  slug: string;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  slug: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
  categoryId?: string;
  viewCount: number;
  isPinned: boolean;
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string;
  headerStyle: 'default' | 'cover-blur' | 'cover-side';
  headerColor: string;
  category?: Category;
  tags?: Tag[];
  author?: {
    id: string;
    name: string;
  };
}

interface RelatedNews {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishedAt: string;
  category?: Category;
}

const NewsDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  
  const [news, setNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<RelatedNews[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookmarked, setBookmarked] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchNewsItem();
      incrementViewCount();
    }
  }, [slug]);

  useEffect(() => {
    if (news) {
      fetchRelatedNews();
      updateMetaTags();
    }
  }, [news]);

  const fetchNewsItem = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/news/slug/${slug}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Новость не найдена');
        } else {
          throw new Error('Ошибка загрузки новости');
        }
        return;
      }
      
      const data = await response.json();
      // Маппинг для корректной работы NewsHeader
      setNews({
        ...data,
        coverImage: data.cover || data.coverImage,
        headerStyle: data.headerStyle || 'default',
        headerColor: data.headerColor || '#f8f9fa',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedNews = async () => {
    try {
      if (!news) return;
      
      const params = new URLSearchParams({
        limit: '4',
        exclude: news.id
      });
      
      if (news.categoryId) {
        params.set('categoryId', news.categoryId);
      }
      
      if (news.tags && news.tags.length > 0) {
        params.set('tagIds', news.tags.map(tag => tag.id).join(','));
      }
      
      const response = await fetch(`/api/news?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRelatedNews(data.news || []);
      }
    } catch (err) {
      console.error('Ошибка загрузки связанных новостей:', err);
    }
  };

  const incrementViewCount = async () => {
    try {
      await fetch(`/api/news/slug/${slug}/view`, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Ошибка увеличения счетчика просмотров:', err);
    }
  };

  const updateMetaTags = () => {
    if (!news) return;

    document.title = news.metaTitle || news.title;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', news.metaDescription || news.excerpt || '');
    }

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', news.title);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', news.excerpt || '');
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = news?.title || '';

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        console.log('Sharing cancelled');
      }
    } else {
      // Fallback - copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        alert('Ссылка скопирована в буфер обмена');
      } catch (err) {
        console.error('Ошибка копирования:', err);
      }
    }
  };

  const toggleBookmark = () => {
    setBookmarked(!bookmarked);
    // Here you would save to localStorage or user preferences
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedNews') || '[]');
    if (bookmarked) {
      const filtered = bookmarks.filter((id: string) => id !== news?.id);
      localStorage.setItem('bookmarkedNews', JSON.stringify(filtered));
    } else {
      bookmarks.push(news?.id);
      localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarks));
    }
  };

  const formatShortDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric'
    });
  };

  const generateBreadcrumbs = () => {
    const breadcrumbs = [
      { label: 'Главная', path: '/' },
      { label: 'Новости', path: '/news' }
    ];
    
    if (news?.category) {
      breadcrumbs.push({
        label: news.category.name,
        path: `/news?category=${news.category.id}`
      });
    }
    
    breadcrumbs.push({
      label: news?.title || 'Новость',
      path: ''
    });
    
    return breadcrumbs;
  };

  if (loading) {
    return (
      <div className="news-detail-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка новости...</p>
        </div>
      </div>
    );
  }

  if (error || !news) {
    return (
      <div className="news-detail-page">
        <div className="error-container">
          <h1>Ошибка</h1>
          <p>{error || 'Новость не найдена'}</p>
          <button 
            className="back-btn"
            onClick={() => navigate('/news')}
          >
            <ArrowLeft size={16} />
            Вернуться к новостям
          </button>
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="news-detail-page">
      {/* Breadcrumbs */}
      <nav className="breadcrumbs">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight size={14} className="breadcrumb-separator" />}
            {crumb.path ? (
              <Link to={crumb.path} className="breadcrumb-link">
                {crumb.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">{crumb.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Back Button */}
      <button 
        className="back-btn-main"
        onClick={() => navigate('/news')}
      >
        <ArrowLeft size={16} />
        Вернуться к новостям
      </button>

      <article className="news-article">
        {/* News Header */}
        <NewsHeader 
          title={news.title}
          excerpt={news.excerpt}
          category={news.category}
          author={news.author}
          publishedAt={news.publishedAt || news.createdAt}
          updatedAt={news.updatedAt}
          viewCount={news.viewCount}
          isPinned={news.isPinned}
          coverImage={news.coverImage}
          headerStyle={news.headerStyle}
          headerColor={news.headerColor}
          onShare={handleShare}
          onBookmark={toggleBookmark}
          isBookmarked={bookmarked}
        />

        {/* Article Content */}
        <div className="article-content">
          <div 
            className="content-html"
            dangerouslySetInnerHTML={{ __html: news.content }}
          />
        </div>

        {/* Article Tags */}
        {news.tags && news.tags.length > 0 && (
          <div className="article-tags">
            <h3 className="tags-title">Теги:</h3>
            <div className="tags-list">
              {news.tags.map(tag => (
                <Link
                  key={tag.id}
                  to={`/news?tags=${tag.id}`}
                  className="tag-link"
                  style={{ backgroundColor: tag.color || '#10b981' }}
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Article Footer */}
        <footer className="article-footer">
          <div className="share-section">
            <h3>Поделиться статьей:</h3>
            <div className="share-buttons">
              <button 
                className="share-btn telegram"
                onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(news.title)}`)}
              >
                Telegram
              </button>
              <button 
                className="share-btn vk"
                onClick={() => window.open(`https://vk.com/share.php?url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(news.title)}`)}
              >
                VKontakte
              </button>
              <button 
                className="share-btn copy"
                onClick={handleShare}
              >
                <ExternalLink size={16} />
                Копировать ссылку
              </button>
            </div>
          </div>
        </footer>
      </article>

      {/* Related News */}
      {relatedNews.length > 0 && (
        <aside className="related-news">
          <h2 className="related-title">Похожие новости</h2>
          <div className="related-grid">
            {relatedNews.map(item => (
              <article key={item.id} className="related-card">
                <div className="related-content">
                  {item.category && (
                    <span 
                      className="related-category"
                      style={{ backgroundColor: item.category.color || '#3b82f6' }}
                    >
                      {item.category.name}
                    </span>
                  )}
                  <h3 className="related-title-text">
                    <Link to={`/news/${item.slug}`}>
                      {item.title}
                    </Link>
                  </h3>
                  {item.excerpt && (
                    <p className="related-excerpt">
                      {item.excerpt.length > 100 
                        ? item.excerpt.substring(0, 100) + '...'
                        : item.excerpt
                      }
                    </p>
                  )}
                  <div className="related-meta">
                    <span className="related-date">
                      {formatShortDate(item.publishedAt)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
};

export default NewsDetailPage;
