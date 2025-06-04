import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Search,
  ChevronDown,
  Tag,
  Eye,
  EyeOff
} from 'lucide-react';
import './CategoryManager.css';

interface Category {
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

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
  isActive: boolean;
}

const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'newsCount'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    color: '#3b82f6',
    isActive: true
  });

  const predefinedColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316',
    '#ec4899', '#6366f1', '#14b8a6', '#eab308'
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Ошибка загрузки категорий');
      }
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingCategory 
        ? `/api/categories/${editingCategory.id}`
        : '/api/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Ошибка сохранения категории');
      }

      await fetchCategories();
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color || '#3b82f6',
      isActive: category.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Ошибка удаления категории');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const toggleActive = async (category: Category) => {
    try {
      const response = await fetch(`/api/categories/${category.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...category,
          isActive: !category.isActive
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка изменения статуса категории');
      }

      await fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
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

  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (category.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterActive === null || category.isActive === filterActive;
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

  if (loading) {
    return (
      <div className="category-manager">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Загрузка категорий...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="category-manager">
      <div className="manager-header">
        <div className="header-content">
          <h1 className="manager-title">
            <Tag className="title-icon" />
            Управление категориями
          </h1>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            <Plus size={20} />
            Добавить категорию
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

      <div className="manager-filters">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Поиск категорий..."
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

      <div className="categories-grid">
        {filteredCategories.map((category) => (
          <div key={category.id} className="category-card">
            <div className="category-header">
              <div className="category-info">
                <div 
                  className="category-color" 
                  style={{ backgroundColor: category.color }}
                ></div>
                <div className="category-details">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-slug">/{category.slug}</p>
                </div>
              </div>
              <div className="category-actions">
                <button
                  className={`status-btn ${category.isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleActive(category)}
                  title={category.isActive ? 'Деактивировать' : 'Активировать'}
                >
                  {category.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  className="edit-btn"
                  onClick={() => handleEdit(category)}
                  title="Редактировать"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(category.id)}
                  title="Удалить"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {category.description && (
              <p className="category-description">{category.description}</p>
            )}

            <div className="category-stats">
              <span className="stat-item">
                <strong>{category._count?.news || 0}</strong> новостей
              </span>
              <span className="stat-item">
                Создана: {new Date(category.createdAt).toLocaleDateString('ru-RU')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="empty-state">
          <Tag size={48} className="empty-icon" />
          <h3>Категории не найдены</h3>
          <p>
            {searchTerm || filterActive !== null 
              ? 'Попробуйте изменить параметры поиска или фильтрации'
              : 'Создайте первую категорию для новостей'
            }
          </p>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingCategory ? 'Редактировать категорию' : 'Создать категорию'}
              </h2>
              <button 
                className="modal-close"
                onClick={resetForm}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label className="form-label">Название *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="Введите название категории"
                />
                <div className="slug-preview">
                  Slug: /{generateSlug(formData.name)}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="form-textarea"
                  placeholder="Краткое описание категории"
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
                    Активная категория
                  </label>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Отмена
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} />
                  {editingCategory ? 'Сохранить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
