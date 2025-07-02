import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Search,
  ChevronDown,
  Hash,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';
import './TagManager.css';

interface Tag {
  id: string;
  name: string;
  description?: string;
  slug: string;
  color?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    news: number;
  };
}

interface TagFormData {
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

const TagManager: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'newsCount' | 'popularity'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState<TagFormData>({
    name: '',
    description: '',
    color: '#10b981',
    isActive: true
  });

  const predefinedColors = [
    '#10b981', '#3b82f6', '#ef4444', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ];

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tags');
      if (!response.ok) {
        throw new Error('Ошибка загрузки тегов');
      }
      const data = await response.json();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingTag 
        ? `/api/tags/${editingTag.id}`
        : '/api/tags';
      
      const method = editingTag ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения тега');
      }

      await fetchTags();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setFormData({
      name: tag.name,
      description: tag.description || '',
      color: tag.color || '#10b981',
      isActive: tag.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот тег?')) {
      return;
    }

    try {
      const response = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления тега');
      }

      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const toggleActive = async (tag: Tag) => {
    try {
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...tag,
          isActive: !tag.isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка изменения статуса тега');
      }

      await fetchTags();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTag(null);
    setFormData({
      name: '',
      description: '',
      color: '#10b981',
      isActive: true
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-zа-я0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const getPopularityLevel = (newsCount: number) => {
    if (newsCount >= 10) return 'high';
    if (newsCount >= 5) return 'medium';
    if (newsCount >= 1) return 'low';
    return 'none';
  };

  const filteredTags = tags
    .filter(tag => {
      const matchesSearch = tag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (tag.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterActive === null || tag.isActive === filterActive;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'newsCount':
        case 'popularity':
          aValue = a._count?.news || 0;
          bValue = b._count?.news || 0;
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const popularTags = tags
    .filter(tag => tag.isActive && (tag._count?.news || 0) > 0)
    .sort((a, b) => (b._count?.news || 0) - (a._count?.news || 0))
    .slice(0, 10);

  if (loading) {
    return (
      <div className="tag-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка тегов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tag-manager">
      <div className="manager-header">
        <div className="header-content">
          <h1 className="manager-title">
            <Hash className="title-icon" />
            Управление тегами
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Добавить тег
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <X size={16} />
          {error}
          <button 
            className="error-close"
            onClick={() => setError(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {popularTags.length > 0 && (
        <div className="popular-tags-section">
          <h2 className="section-title">
            <TrendingUp size={20} />
            Популярные теги
          </h2>
          <div className="popular-tags-cloud">
            {popularTags.map((tag) => (
              <div 
                key={tag.id} 
                className={`popular-tag ${getPopularityLevel(tag._count?.news || 0)}`}
                style={{ backgroundColor: tag.color }}
              >
                <span className="tag-name">#{tag.name}</span>
                <span className="tag-count">{tag._count?.news}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="manager-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Поиск тегов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <label className="filter-label">Статус:</label>
            <select
              value={filterActive === null ? 'all' : filterActive ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterActive(value === 'all' ? null : value === 'active');
              }}
              className="filter-select"
            >
              <option value="all">Все</option>
              <option value="active">Активные</option>
              <option value="inactive">Неактивные</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Сортировка:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="filter-select"
            >
              <option value="name">По названию</option>
              <option value="createdAt">По дате создания</option>
              <option value="popularity">По популярности</option>
              <option value="newsCount">По количеству новостей</option>
            </select>
            <button
              className="sort-order-btn"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              <ChevronDown 
                className={`sort-icon ${sortOrder === 'desc' ? 'rotated' : ''}`} 
              />
            </button>
          </div>
        </div>
      </div>

      <div className="tags-grid">
        {filteredTags.map((tag) => (
          <div key={tag.id} className="tag-card">
            <div className="tag-header">
              <div className="tag-info">
                <div 
                  className="tag-color" 
                  style={{ backgroundColor: tag.color }}
                ></div>
                <div className="tag-details">
                  <h3 className="tag-name">#{tag.name}</h3>
                  <p className="tag-slug">/{tag.slug}</p>
                </div>
              </div>
              <div className="tag-actions">
                <button
                  className={`status-btn ${tag.isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleActive(tag)}
                  title={tag.isActive ? 'Деактивировать' : 'Активировать'}
                >
                  {tag.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(tag)}
                  title="Редактировать"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(tag.id)}
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {tag.description && (
              <p className="tag-description">{tag.description}</p>
            )}

            <div className="tag-stats">
              <div className="stat-item">
                <strong>{tag._count?.news || 0}</strong> новостей
                <div className={`popularity-indicator ${getPopularityLevel(tag._count?.news || 0)}`}>
                  <TrendingUp size={12} />
                </div>
              </div>
              <span className="stat-item">
                Создан: {new Date(tag.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredTags.length === 0 && (
        <div className="empty-state">
          <Hash size={48} className="empty-icon" />
          <h3>Теги не найдены</h3>
          <p>
            {searchTerm || filterActive !== null 
              ? 'Попробуйте изменить параметры поиска или фильтрации'
              : 'Создайте первый тег для новостей'
            }
          </p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingTag ? 'Редактировать тег' : 'Создать тег'}
              </h2>
              <button 
                className="modal-close"
                onClick={resetForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="tag-form">
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="Введите название тега"
                />
                <div className="slug-preview">
                  Slug: /{generateSlug(formData.name)}
                </div>
                <div className="tag-preview">
                  #{formData.name}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Краткое описание тега"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Цвет</label>
                <div className="color-picker">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="color-input"
                  />
                  <div className="color-presets">
                    {predefinedColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`color-preset ${formData.color === color ? 'selected' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setFormData({...formData, color})}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="form-group">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="checkbox-input"
                  />
                  <label htmlFor="isActive" className="checkbox-label">
                    Активный тег
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingTag ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TagManager;
