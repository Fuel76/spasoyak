import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Reading, ReadingType } from '../../types/calendar';

interface ReadingFormData {
  type: ReadingType;
  reference: string;
  title: string;
  text: string;
  order: number;
}

const AdminReadingsPage: React.FC = () => {
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingReading, setEditingReading] = useState<Reading | null>(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState<ReadingFormData>({
    type: ReadingType.APOSTLE,
    reference: '',
    title: '',
    text: '',
    order: 0
  });

  // Загрузка чтений
  const fetchReadings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/calendar/admin/readings');
      if (!response.ok) throw new Error('Ошибка загрузки чтений');
      const data = await response.json();
      setReadings(data);
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  // Обработка формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'order' ? parseInt(value) || 0 : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const url = editingReading 
        ? `/api/calendar/readings/${editingReading.id}`
        : '/api/calendar/readings';
      
      const method = editingReading ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Ошибка сохранения');
      
      setSuccess(editingReading ? 'Чтение обновлено!' : 'Чтение добавлено!');
      resetForm();
      fetchReadings();
    } catch (error: any) {
      setError(error.message || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: ReadingType.APOSTLE,
      reference: '',
      title: '',
      text: '',
      order: 0
    });
    setEditingReading(null);
    setShowForm(false);
  };

  const handleEdit = (reading: Reading) => {
    setFormData({
      type: reading.type,
      reference: reading.reference,
      title: reading.title || '',
      text: reading.text || '',
      order: reading.order
    });
    setEditingReading(reading);
    setShowForm(true);
  };

  const handleDelete = async (readingId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить это чтение?')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/readings/${readingId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      
      setSuccess('Чтение удалено!');
      fetchReadings();
    } catch (error: any) {
      setError(error.message || 'Ошибка удаления');
    } finally {
      setLoading(false);
    }
  };

  const getReadingTypeLabel = (type: ReadingType) => {
    switch (type) {
      case ReadingType.APOSTLE: return '📜 Апостольское чтение';
      case ReadingType.GOSPEL: return '✠ Евангелие';
      case ReadingType.OLD_TESTAMENT: return '📖 Ветхий Завет';
      case ReadingType.PROKEIMENON: return '🎵 Прокимен';
      case ReadingType.ALLELUIA: return '🎵 Аллилуйя';
      default: return type;
    }
  };

  const groupedReadings = readings.reduce((groups, reading) => {
    if (!groups[reading.type]) groups[reading.type] = [];
    groups[reading.type].push(reading);
    return groups;
  }, {} as Record<ReadingType, Reading[]>);

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Управление чтениями</h1>
        
        <div className="admin-calendar-nav">
          <Link to="/admin/calendar" className="system-btn-outline">← Назад к календарю</Link>
          <button 
            className="system-btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Скрыть форму' : 'Добавить чтение'}
          </button>
        </div>

        {/* Форма добавления/редактирования */}
        {showForm && (
          <div className="system-content-card">
            <h2>{editingReading ? 'Редактировать чтение' : 'Добавить чтение'}</h2>
            
            <form onSubmit={handleSubmit} className="system-form">
              <div className="system-form-row">
                <div className="system-form-group">
                  <label className="system-form-label">Тип чтения *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="system-form-input"
                    required
                  >
                    <option value={ReadingType.APOSTLE}>Апостольское чтение</option>
                    <option value={ReadingType.GOSPEL}>Евангелие</option>
                    <option value={ReadingType.OLD_TESTAMENT}>Ветхий Завет</option>
                    <option value={ReadingType.PROKEIMENON}>Прокимен</option>
                    <option value={ReadingType.ALLELUIA}>Аллилуйя</option>
                  </select>
                </div>

                <div className="system-form-group">
                  <label className="system-form-label">Порядок</label>
                  <input
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleInputChange}
                    className="system-form-input"
                    min="0"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="system-form-group">
                <label className="system-form-label">Ссылка *</label>
                <input
                  type="text"
                  name="reference"
                  value={formData.reference}
                  onChange={handleInputChange}
                  className="system-form-input"
                  required
                  placeholder="Например: Мф. 5:1-12"
                />
              </div>

              <div className="system-form-group">
                <label className="system-form-label">Заголовок</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="system-form-input"
                  placeholder="Краткое название чтения"
                />
              </div>

              <div className="system-form-group">
                <label className="system-form-label">Текст чтения</label>
                <textarea
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  className="system-form-input"
                  rows={6}
                  placeholder="Полный текст чтения (необязательно)"
                />
              </div>

              <div className="system-form-actions">
                <button 
                  type="submit" 
                  className="system-btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Сохранение...' : (editingReading ? 'Обновить' : 'Добавить')}
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

        {/* Список чтений по типам */}
        <div className="system-content-card">
          <h2>Список чтений ({readings.length})</h2>
          
          {loading ? (
            <div className="system-alert system-alert-info">Загрузка...</div>
          ) : readings.length === 0 ? (
            <div className="system-alert system-alert-warning">
              Чтения не найдены. Добавьте первое чтение.
            </div>
          ) : (
            <div className="readings-groups">
              {Object.entries(groupedReadings).map(([type, typeReadings]) => (
                <div key={type} className="reading-type-group">
                  <h3 className="reading-type-title">
                    {getReadingTypeLabel(type as ReadingType)} ({typeReadings.length})
                  </h3>
                  
                  <div className="readings-list">
                    {typeReadings
                      .sort((a, b) => a.order - b.order)
                      .map(reading => (
                        <div key={reading.id} className="reading-card">
                          <div className="reading-info">
                            <div className="reading-reference">{reading.reference}</div>
                            {reading.title && (
                              <div className="reading-title">{reading.title}</div>
                            )}
                            {reading.text && (
                              <div className="reading-text">
                                {reading.text.substring(0, 150)}
                                {reading.text.length > 150 && '...'}
                              </div>
                            )}
                            <div className="reading-order">Порядок: {reading.order}</div>
                          </div>
                          
                          <div className="reading-actions">
                            <button 
                              className="system-btn-outline system-btn-sm"
                              onClick={() => handleEdit(reading)}
                            >
                              Редактировать
                            </button>
                            <button 
                              className="system-btn-outline system-btn-sm system-btn-danger"
                              onClick={() => handleDelete(reading.id)}
                            >
                              Удалить
                            </button>
                          </div>
                        </div>
                      ))}
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

export default AdminReadingsPage;
