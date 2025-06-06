import React from 'react';
import { 
  Calendar, 
  User, 
  Eye, 
  Share2, 
  Bookmark,
  Clock,
  Star
} from 'lucide-react';
import './NewsHeader.css';

interface Category {
  id: string;
  name: string;
  color?: string;
  slug: string;
}

interface Author {
  id: string;
  name: string;
}

interface NewsHeaderProps {
  title: string;
  excerpt?: string;
  coverImage?: string;
  headerStyle?: 'default' | 'cover-blur' | 'cover-side';
  headerColor?: string;
  category?: Category;
  author?: Author;
  publishedAt?: string;
  updatedAt?: string;
  viewCount?: number;
  isPinned?: boolean;
  showExcerpt?: boolean;
  size?: 'small' | 'medium' | 'large';
  onShare?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
}

export const NewsHeader: React.FC<NewsHeaderProps> = ({
  title,
  excerpt,
  coverImage,
  headerStyle = 'default',
  headerColor = '#f8f9fa',
  category,
  author,
  publishedAt,
  updatedAt,
  viewCount,
  isPinned,
  showExcerpt = true,
  size = 'large',
  onShare,
  onBookmark,
  isBookmarked
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderContent = () => (
    <div className="news-header-content">
      {isPinned && (
        <div className="pinned-badge">
          <Star size={16} />
          Закреплено
        </div>
      )}

      {category && (
        <div 
          className="category-badge"
          style={{ backgroundColor: category.color || '#3b82f6' }}
        >
          {category.name}
        </div>
      )}

      <h1 className="news-header-title">{title}</h1>
      
      {showExcerpt && excerpt && (
        <p className="news-header-excerpt">{excerpt}</p>
      )}

      <div className="news-header-meta">
        <div className="meta-primary">
          {publishedAt && (
            <span className="meta-item">
              <Calendar size={16} />
              {formatDate(publishedAt)}
            </span>
          )}
          {author && (
            <span className="meta-item">
              <User size={16} />
              {author.name}
            </span>
          )}
          {viewCount !== undefined && (
            <span className="meta-item">
              <Eye size={16} />
              {viewCount} просмотров
            </span>
          )}
        </div>

        {(onShare || onBookmark) && (
          <div className="header-actions">
            {onShare && (
              <button 
                className="action-btn"
                onClick={onShare}
                title="Поделиться"
              >
                <Share2 size={18} />
              </button>
            )}
            {onBookmark && (
              <button 
                className={`action-btn ${isBookmarked ? 'active' : ''}`}
                onClick={onBookmark}
                title={isBookmarked ? 'Удалить из закладок' : 'Добавить в закладки'}
              >
                <Bookmark size={18} />
              </button>
            )}
          </div>
        )}
      </div>

      {updatedAt && publishedAt && updatedAt !== publishedAt && (
        <div className="update-notice">
          <Clock size={14} />
          Обновлено: {formatDate(updatedAt)}
        </div>
      )}
    </div>
  );

  const renderCoverImage = () => (
    coverImage && (
      <div className="news-header-image">
        <img src={coverImage} alt={title} />
      </div>
    )
  );

  switch (headerStyle) {
    case 'cover-blur':
      return (
        <div 
          className={`news-header news-header--blur news-header--${size}`}
          style={{
            backgroundImage: coverImage ? `url(${coverImage})` : undefined,
            backgroundColor: headerColor,
          }}
        >
          <div className="news-header-overlay">
            {renderContent()}
          </div>
        </div>
      );

    case 'cover-side':
      return (
        <div 
          className={`news-header news-header--side news-header--${size}`}
          style={{ backgroundColor: headerColor }}
        >
          <div className="news-header-layout">
            {renderContent()}
            {renderCoverImage()}
          </div>
        </div>
      );

    default:
      return (
        <div 
          className={`news-header news-header--default news-header--${size}`}
          style={{ backgroundColor: headerColor }}
        >
          {renderContent()}
        </div>
      );
  }
};

export default NewsHeader;
