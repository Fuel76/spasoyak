import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Saint, SaintPriority } from '../../types/calendar';

interface SaintFormData {
  name: string;
  description: string;
  icon: string;
  priority: SaintPriority;
}

const AdminSaintsPage: React.FC = () => {
  const [saints, setSaints] = useState<Saint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingSaint, setEditingSaint] = useState<Saint | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<SaintFormData>({
    name: '',
    description: '',
    icon: '',
    priority: SaintPriority.COMMEMORATED
  });

  // Загрузка святых
  const fetchSaints = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/calendar/admin/saints');
      if (!response.ok) throw new Error('Ошибка загрузки святых');
      const data = await response.json();
      setSaints(data);
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaints();
  }, []);

  // Обработка формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = editingSaint 
        ? `/api/calendar/saints/${editingSaint.id}`
        : '/api/calendar/saints';
      
      const method = editingSaint ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Ошибка сохранения');
      
      setSuccess(editingSaint ? 'Святой обновлен!' : 'Святой добавлен!');
      resetForm();
      fetchSaints();
    } catch (error: any) {
      setError(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '',
      priority: SaintPriority.COMMEMORATED
    });
    setEditingSaint(null);
    setShowForm(false);
  };

  const handleEdit = (saint: Saint) => {
    setFormData({
      name: saint.name,
      description: saint.description || '',
      icon: saint.icon || '',
      priority: saint.priority
    });
    setEditingSaint(saint);
    setShowForm(true);
  };

  const handleDelete = async (saintId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого святого?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/saints/${saintId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      
      setSuccess('Святой удален!');
      fetchSaints();
    } catch (error: any) {
      setError(error.message || 'Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityLabel = (priority: SaintPriority) => {
    switch (priority) {
      case SaintPriority.GREAT_SAINT: return 'Великий святой';
      case SaintPriority.POLYELEOS_SAINT: return 'Полиелейный святой';
      case SaintPriority.VIGIL_SAINT: return 'Святой со всенощным бдением';
      case SaintPriority.SIXTH_CLASS: return 'Шестеричный святой';
      case SaintPriority.COMMEMORATED: return 'Поминаемый';
      default: return priority;
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Управление святцами</h1>
        
        <div className="admin-calendar-nav">
          <Link to="/admin/calendar" className="system-btn-outline">← Назад к календарю</Link>
          <button 
            className="system-btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Скрыть форму' : 'Добавить святого'}
          </button>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && (
          <div className="system-content-card">
            <h2>{editingSaint ? 'Редактировать святого' : 'Добавить святого'}</h2>
            
            <form onSubmit={handleSubmit} className="system-form">
              <div className="system-form-group">
                <label className="system-form-label">Имя святого *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="system-form-input"
                  required
                  placeholder="Например: Святитель Николай Чудотворец"
                />
              </div>

              <div className="system-form-group">
                <label className="system-form-label">Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="system-form-input"
                  rows={3}
                  placeholder="Краткое описание жития или подвига святого"
                />
              </div>

              <div className="system-form-group">
                <label className="system-form-label">Приоритет</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="system-form-input"
                >
                  <option value={SaintPriority.COMMEMORATED}>Поминаемый</option>
                  <option value={SaintPriority.SIXTH_CLASS}>Шестеричный святой</option>
                  <option value={SaintPriority.VIGIL_SAINT}>Святой со всенощным бдением</option>
                  <option value={SaintPriority.POLYELEOS_SAINT}>Полиелейный святой</option>
                  <option value={SaintPriority.GREAT_SAINT}>Великий святой</option>
                </select>
              </div>

              <div className="system-form-group">
                <label className="system-form-label">URL иконы</label>
                <input
                  type="url"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  className="system-form-input"
                  placeholder="https://example.com/icon.jpg"
                />
              </div>

              <div className="system-form-actions">
                <button 
                  type="submit" 
                  className="system-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : (editingSaint ? 'Обновить' : 'Добавить')}
                </button>
                <button 
                  type="button" 
                  className="system-btn-outline"
                  onClick={resetForm}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Сообщения */}
        {error && <div className="system-alert system-alert-error">{error}</div>}
        {success && <div className="system-alert system-alert-success">{success}</div>}

        {/* Список святых */}
        <div className="system-content-card">
          <h2>Список святых ({saints.length})</h2>
          
          {loading ? (
            <div className="system-alert system-alert-info">Загрузка...</div>
          ) : saints.length === 0 ? (
            <div className="system-alert system-alert-warning">
              Святые не найдены. Добавьте первого святого.
            </div>
          ) : (
            <div className="saints-list">
              {saints.map(saint => (
                <div key={saint.id} className="saint-card">
                  {saint.icon && (
                    <img src={saint.icon} alt={saint.name} className="saint-icon" />
                  )}
                  
                  <div className="saint-info">
                    <h3 className="saint-name">{saint.name}</h3>
                    <div className="saint-priority">
                      {getPriorityLabel(saint.priority)}
                    </div>
                    {saint.description && (
                      <p className="saint-description">{saint.description}</p>
                    )}
                  </div>
                  
                  <div className="saint-actions">
                    <button 
                      className="system-btn-outline system-btn-sm"
                      onClick={() => handleEdit(saint)}
                    >
                      Редактировать
                    </button>
                    <button 
                      className="system-btn-outline system-btn-sm system-btn-danger"
                      onClick={() => handleDelete(saint.id)}
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSaintsPage;
