import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft,
  ChevronRight,
  Grid,
  List
} from 'lucide-react';
import NewsCard from '../components/NewsCard';
import './NewsPage.css';

interface Category {
  id: string;
  name: string;
  color?: string;
  slug: string;
  isActive?: boolean;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
  slug: string;
  isActive?: boolean;
}

interface NewsItem {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  slug: string;
  publishedAt: string;
  createdAt: string;
  authorId?: string;
  categoryId?: string;
  viewCount: number;
  isPinned: boolean;
  metaTitle?: string;
  metaDescription?: string;
  category?: Category;
  tags?: Tag[];
  author?: {
    id: string;
    name: string;
  };
}

const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'publishedAt' | 'viewCount' | 'title'>('publishedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  
  // UI State
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchTags();
  }, []);

  useEffect(() => {
    fetchNews();
  }, [currentPage, searchTerm, selectedCategory, selectedTags, sortBy, sortOrder]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.set('search', searchTerm);
      if (selectedCategory) params.set('categoryId', selectedCategory);
      if (selectedTags.length > 0) params.set('tagIds', selectedTags.join(','));

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) {
        throw new Error('Ошибка загрузки новостей');
      }
      
      const data = await response.json();
      setNews(data.news || []);
      setTotalItems(data.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data.filter((cat: Category) => cat.isActive !== false));
      }
    } catch (err) {
      console.error('Ошибка загрузки категорий:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await fetch('/api/tags');
      if (response.ok) {
        const data = await response.json();
        setTags(data.filter((tag: Tag) => tag.isActive !== false));
      }
    } catch (err) {
      console.error('Ошибка загрузки тегов:', err);
    }
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedTags([]);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading && currentPage === 1) {
    return (
      <div className="news-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка новостей...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="news-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">Новости и публикации</h1>
          <p className="page-description">
            Последние новости и важные публикации
          </p>
        </div>
        
        <div className="header-actions">
          <button
            className={`view-toggle ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Сетка"
          >
            <Grid size={18} />
          </button>
          <button
            className={`view-toggle ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Список"
          >
            <List size={18} />
          </button>
          <button
            className="filters-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={18} />
            Фильтры
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
        </div>
      )}

      <div className={`filters-panel ${showFilters ? 'expanded' : ''}`}>
        <div className="filters-content">
          <div className="search-section">
            <div className="search-box">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Поиск новостей..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          <div className="filter-section">
            <div className="filter-group">
              <label className="filter-label">Категория:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="filter-select"
              >
                <option value="">Все категории</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Сортировка:</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field as any);
                  setSortOrder(order as any);
                }}
                className="filter-select"
              >
                <option value="publishedAt-desc">Сначала новые</option>
                <option value="publishedAt-asc">Сначала старые</option>
                <option value="viewCount-desc">По популярности</option>
                <option value="title-asc">По алфавиту</option>
              </select>
            </div>

            {(searchTerm || selectedCategory || selectedTags.length > 0) && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Сбросить фильтры
              </button>
            )}
          </div>

          {tags.length > 0 && (
            <div className="tags-section">
              <label className="filter-label">Теги:</label>
              <div className="tags-cloud">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className={`tag-chip ${selectedTags.includes(tag.id) ? 'selected' : ''}`}
                    style={{ 
                      backgroundColor: selectedTags.includes(tag.id) 
                        ? tag.color || '#10b981' 
                        : 'transparent',
                      borderColor: tag.color || '#10b981',
                      color: selectedTags.includes(tag.id) ? '#fff' : tag.color || '#10b981'
                    }}
                    onClick={() => handleTagToggle(tag.id)}
                  >
                    #{tag.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="news-content">
        {news.length === 0 ? (
          <div className="empty-state">
            <h3>Новости не найдены</h3>
            <p>
              {searchTerm || selectedCategory || selectedTags.length > 0
                ? 'Попробуйте изменить параметры поиска'
                : 'В данный момент новостей нет'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="results-info">
              <span className="results-count">
                Найдено: {totalItems} {totalItems === 1 ? 'новость' : totalItems < 5 ? 'новости' : 'новостей'}
              </span>
            </div>

            <div className={`news-${viewMode}`}>
              {news.map(item => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  excerpt={item.excerpt}
                  content={item.content}
                  slug={item.slug}
                  category={item.category}
                  tags={item.tags}
                  author={item.author}
                  publishedAt={item.publishedAt}
                  createdAt={item.createdAt}
                  viewCount={item.viewCount}
                  isPinned={item.isPinned}
                  viewMode={viewMode}
                  maxExcerptLength={viewMode === 'grid' ? 150 : 250}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={16} />
                  Назад
                </button>

                <div className="pagination-info">
                  <span>
                    Страница {currentPage} из {totalPages}
                  </span>
                </div>

                <button
                  className="pagination-btn"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Вперед
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default NewsPage;
