import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Eye, Star, Clock, TrendingUp } from 'lucide-react';
import './NewsCard.css';

interface Category {
  id: string;
  name: string;
  color?: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface Author {
  id: string;
  name: string;
  avatar?: string;
}

interface NewsCardProps {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  coverUrl?: string;
  slug: string;
  category?: Category;
  tags?: Tag[];
  author?: Author;
  publishedAt?: string;
  createdAt: string;
  updatedAt?: string;
  viewCount?: number;
  isPinned?: boolean;
  isVisible?: boolean;
  viewMode?: 'grid' | 'list';
  showTags?: boolean;
  maxExcerptLength?: number;
}

const NewsCard: React.FC<NewsCardProps> = ({
  title,
  excerpt,
  content,
  coverUrl,
  slug,
  category,
  tags = [],
  author,
  publishedAt,
  createdAt,
  updatedAt,
  viewCount = 0,
  isPinned = false,
  isVisible = true,
  viewMode = 'grid',
  showTags = true,
  maxExcerptLength = 150
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Сегодня';
    if (days === 1) return 'Вчера';
    if (days < 7) return `${days} дней назад`;
    if (days < 30) return `${Math.floor(days / 7)} недель назад`;
    if (days < 365) return `${Math.floor(days / 30)} месяцев назад`;
    return `${Math.floor(days / 365)} лет назад`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const getExcerptFromContent = () => {
    if (excerpt) return excerpt;
    if (!content) return '';
    
    // Убираем HTML теги и получаем текст
    const textContent = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
    return textContent;
  };

  const displayExcerpt = getExcerptFromContent();
  const isUpdated = updatedAt && updatedAt !== createdAt;
  const isNew = new Date(createdAt).getTime() > Date.now() - (7 * 24 * 60 * 60 * 1000); // Новее 7 дней
  const isTrending = viewCount > 100; // Популярная новость

  if (!isVisible) return null;

  return (
    <article className={`news-card ${viewMode} ${isPinned ? 'pinned' : ''} ${isNew ? 'new' : ''}`}>
      {/* Badges */}
      <div className="card-badges">
        {isPinned && (
          <div className="badge pinned-badge">
            <Star size={12} />
            Закреплено
          </div>
        )}
        {isNew && !isPinned && (
          <div className="badge new-badge">
            Новое
          </div>
        )}
        {isTrending && (
          <div className="badge trending-badge">
            <TrendingUp size={12} />
            Популярное
          </div>
        )}
      </div>

      {/* Cover Image */}
      {coverUrl && (
        <div className="card-cover">
          <Link to={`/news/${slug}`}>
            <img src={coverUrl} alt={title} />
          </Link>
          {category && (
            <div 
              className="cover-category"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.name}
            </div>
          )}
        </div>
      )}

      {/* Card Content */}
      <div className="card-content">
        {/* Header */}
        <div className="card-header">
          {!coverUrl && category && (
            <span 
              className="category-badge"
              style={{ backgroundColor: category.color || '#3b82f6' }}
            >
              {category.name}
            </span>
          )}
          
          <div className="meta-info">
            <span className="meta-item date-meta">
              <Calendar size={14} />
              <span className="date-text">
                {formatDate(publishedAt || createdAt)}
              </span>
              <span className="relative-date">
                {formatRelativeDate(publishedAt || createdAt)}
              </span>
            </span>
            
            {author && (
              <span className="meta-item author-meta">
                {author.avatar ? (
                  <img src={author.avatar} alt={author.name} className="author-avatar" />
                ) : (
                  <User size={14} />
                )}
                {author.name}
              </span>
            )}
            
            <span className="meta-item views-meta">
              <Eye size={14} />
              {viewCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="card-title">
          <Link to={`/news/${slug}`}>
            {title}
          </Link>
        </h2>

        {/* Excerpt */}
        {displayExcerpt && (
          <p className="card-excerpt">
            {truncateText(displayExcerpt, maxExcerptLength)}
          </p>
        )}

        {/* Tags */}
        {showTags && tags.length > 0 && (
          <div className="card-tags">
            {tags.slice(0, viewMode === 'grid' ? 3 : 5).map(tag => (
              <Link
                key={tag.id}
                to={`/news?tags=${tag.id}`}
                className="tag-badge"
                style={{ backgroundColor: tag.color || '#10b981' }}
              >
                #{tag.name}
              </Link>
            ))}
            {tags.length > (viewMode === 'grid' ? 3 : 5) && (
              <span className="more-tags">
                +{tags.length - (viewMode === 'grid' ? 3 : 5)}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="card-footer">
          <Link to={`/news/${slug}`} className="read-more-btn">
            {viewMode === 'grid' ? 'Читать' : 'Читать полностью'}
          </Link>
          
          <div className="footer-meta">
            {isUpdated && (
              <span className="updated-badge">
                <Clock size={12} />
                Обновлено
              </span>
            )}
            
            <div className="interaction-stats">
              {viewCount > 0 && (
                <span className="stat-item">
                  <Eye size={12} />
                  {viewCount > 1000 ? `${Math.floor(viewCount / 1000)}k` : viewCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="card-overlay"></div>
    </article>
  );
};

export default NewsCard;
