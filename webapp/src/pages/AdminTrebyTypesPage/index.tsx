import React, { useState, useEffect } from 'react';
import { TrebaTypesApiV2 } from '../../services/treba-api-v2';
import { TrebaTypeV2 } from '../../types/treba-v2';
import './AdminTrebyTypesPage.css';
import '../../styles/system-pages.css';

const AdminTrebyTypesPage: React.FC = () => {
  const [trebaTypes, setTrebaTypes] = useState<TrebaTypeV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState<TrebaTypeV2 | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    currency: 'RUB',
    period: 'Разовое',
    isActive: true,
  });

  useEffect(() => {
    loadTrebaTypes();
  }, []);

  const loadTrebaTypes = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      const response = await TrebaTypesApiV2.getAll();
      setTrebaTypes(response.data || []);
    } catch (err) {
      setError('Ошибка при загрузке типов треб');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingType) {
        await TrebaTypesApiV2.update(editingType.id, formData);
      } else {
        await TrebaTypesApiV2.create(formData);
      }

      await loadTrebaTypes();
      resetForm();
    } catch (err) {
      setError('Ошибка при сохранении типа требы');
      console.error(err);
    }
  };

  const handleEdit = (trebaType: TrebaTypeV2) => {
    setEditingType(trebaType);
    setFormData({
      name: trebaType.name,
      description: trebaType.description || '',
      basePrice: trebaType.basePrice,
      currency: trebaType.currency,
      period: trebaType.period,
      isActive: trebaType.isActive,
    });
    setShowAddForm(true);
  };

  const handleToggleActive = async (id: number) => {
    try {
      await TrebaTypesApiV2.toggleActive(id);
      await loadTrebaTypes();
    } catch (err: any) {
      setError(err.message || 'Ошибка при изменении статуса типа требы');
      console.error(err);
    }
  };

  const handleDelete = async (id: number, typeName: string, isActive: boolean) => {
    // Сначала предупредим пользователя о возможных проблемах
    const confirmMessage = `Вы уверены, что хотите удалить тип требы "${typeName}"?\n\n` +
      `⚠️ ВНИМАНИЕ: Если для этого типа уже есть заявки, удаление будет невозможно.\n` +
      `В таком случае рекомендуется деактивировать тип вместо удаления.\n\n` +
      `Продолжить удаление?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      await TrebaTypesApiV2.delete(id);
      await loadTrebaTypes();
      setSuccess('Тип требы успешно удален');
    } catch (err: any) {
      // Показываем детальное сообщение об ошибке и предлагаем альтернативу
      if (err.message.includes('связанные требы')) {
        const shouldDeactivate = confirm(
          `❌ Удаление невозможно: для типа "${typeName}" уже есть заявки.\n\n` +
          `💡 Рекомендуется деактивировать тип вместо удаления.\n` +
          `Деактивированный тип не будет отображаться в форме подачи треб,\n` +
          `но существующие заявки останутся в системе.\n\n` +
          `Деактивировать тип требы "${typeName}"?`
        );
        
        if (shouldDeactivate && isActive) {
          try {
            await TrebaTypesApiV2.toggleActive(id);
            await loadTrebaTypes();
            setSuccess(`Тип требы "${typeName}" успешно деактивирован`);
          } catch (toggleErr: any) {
            setError(`Ошибка при деактивации: ${toggleErr.message}`);
          }
        } else if (shouldDeactivate && !isActive) {
          setError(`Тип требы "${typeName}" уже деактивирован`);
        } else {
          setError('Операция отменена пользователем');
        }
      } else {
        setError(err.message || 'Ошибка при удалении типа требы');
      }
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      currency: 'RUB',
      period: 'Разовое',
      isActive: true,
    });
    setEditingType(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">Загрузка типов треб...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Управление типами треб</h1>
        <p>Создание и настройка типов церковных треб</p>
        <button 
          className="btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          Добавить тип требы
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingType ? 'Редактировать тип требы' : 'Добавить тип требы'}</h2>
              <button onClick={resetForm} className="modal-close">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="treba-type-form">
              <div className="form-group">
                <label htmlFor="name">Название требы *</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Например: Молебен о здравии"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Подробное описание требы"
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="basePrice">Базовая стоимость *</label>
                  <input
                    type="number"
                    id="basePrice"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="currency">Валюта</label>
                  <select
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="RUB">RUB</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="period">Период</label>
                <select
                  id="period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                >
                  <option value="Разовое">Разовое</option>
                  <option value="Ежедневно">Ежедневно</option>
                  <option value="Еженедельно">Еженедельно</option>
                  <option value="Ежемесячно">Ежемесячно</option>
                  <option value="40 дней">40 дней</option>
                  <option value="Полгода">Полгода</option>
                  <option value="Год">Год</option>
                </select>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Активная треба (доступна для заказа)
                </label>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingType ? 'Сохранить изменения' : 'Создать тип требы'}
                </button>
                <button type="button" onClick={resetForm} className="btn-secondary">
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="treba-types-list">
        {trebaTypes.length === 0 ? (
          <div className="empty-state">
            <p>Типы треб не найдены</p>
            <p>Создайте первый тип требы для начала работы</p>
          </div>
        ) : (
          <div className="treba-types-grid">
            {trebaTypes.map((trebaType) => (
              <div key={trebaType.id} className={`treba-type-card ${!trebaType.isActive ? 'inactive' : ''}`}>
                <div className="card-header">
                  <h3>{trebaType.name}</h3>
                  <div className="card-status">
                    {trebaType.isActive ? (
                      <span className="status-active">Активна</span>
                    ) : (
                      <span className="status-inactive">Неактивна</span>
                    )}
                  </div>
                </div>
                
                <div className="card-content">
                  <p className="description">{trebaType.description || 'Без описания'}</p>
                  
                  <div className="price-info">
                    <span className="price">{trebaType.basePrice} {trebaType.currency}</span>
                    <span className="period">{trebaType.period}</span>
                  </div>
                  
                  <div className="meta-info">
                    <small>Создано: {formatDate(trebaType.createdAt)}</small>
                  </div>
                </div>
                
                <div className="card-actions">
                  <button 
                    onClick={() => handleEdit(trebaType)}
                    className="btn-edit"
                  >
                    Редактировать
                  </button>
                  <button 
                    onClick={() => handleDelete(trebaType.id, trebaType.name, trebaType.isActive)}
                    className="btn-delete"
                  >
                    Удалить
                  </button>
                  <button 
                    onClick={() => handleToggleActive(trebaType.id)}
                    className={`btn-toggle ${trebaType.isActive ? 'active' : 'inactive'}`}
                  >
                    {trebaType.isActive ? 'Деактивировать' : 'Активировать'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTrebyTypesPage;
