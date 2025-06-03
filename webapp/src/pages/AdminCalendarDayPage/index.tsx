import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDay, Saint, Reading, DayPriority, FastingType, SaintPriority, ReadingType } from '../../types/calendar';

const AdminCalendarDayPage: React.FC = () => {
  const { date } = useParams<{ date: string }>();
  const [calendarDay, setCalendarDay] = useState<CalendarDay | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Формы для добавления
  const [showSaintForm, setShowSaintForm] = useState(false);
  const [showReadingForm, setShowReadingForm] = useState(false);
  
  const [saintForm, setSaintForm] = useState({
    name: '',
    description: '',
    priority: SaintPriority.COMMEMORATED
  });
  
  const [readingForm, setReadingForm] = useState({
    type: ReadingType.APOSTLE,
    reference: '',
    title: '',
    text: '',
    order: 0
  });

  // Загрузка данных дня
  const fetchCalendarDay = async () => {
    if (!date) return;
    
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/calendar/${date}`);
      if (!response.ok) throw new Error('Ошибка загрузки дня');
      const data = await response.json();
      setCalendarDay(data);
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarDay();
  }, [date]);

  // Добавление святого к дню
  const handleAddSaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/calendar/${date}/saints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saintForm)
      });

      if (!response.ok) throw new Error('Ошибка добавления святого');
      
      setSuccess('Святой добавлен!');
      setSaintForm({ name: '', description: '', priority: SaintPriority.COMMEMORATED });
      setShowSaintForm(false);
      fetchCalendarDay();
    } catch (error: any) {
      setError(error.message || 'Ошибка добавления');
    } finally {
      setLoading(false);
    }
  };

  // Добавление чтения к дню
  const handleAddReading = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch(`/api/calendar/${date}/readings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(readingForm)
      });

      if (!response.ok) throw new Error('Ошибка добавления чтения');
      
      setSuccess('Чтение добавлено!');
      setReadingForm({ type: ReadingType.APOSTLE, reference: '', title: '', text: '', order: 0 });
      setShowReadingForm(false);
      fetchCalendarDay();
    } catch (error: any) {
      setError(error.message || 'Ошибка добавления');
    } finally {
      setLoading(false);
    }
  };

  // Удаление святого
  const handleDeleteSaint = async (saintId: number) => {
    if (!window.confirm('Удалить этого святого из дня?')) return;
    
    try {
      const response = await fetch(`/api/calendar/saints/${saintId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      
      setSuccess('Святой удален!');
      fetchCalendarDay();
    } catch (error: any) {
      setError(error.message || 'Ошибка удаления');
    }
  };

  // Удаление чтения
  const handleDeleteReading = async (readingId: number) => {
    if (!window.confirm('Удалить это чтение из дня?')) return;
    
    try {
      const response = await fetch(`/api/calendar/readings/${readingId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Ошибка удаления');
      
      setSuccess('Чтение удалено!');
      fetchCalendarDay();
    } catch (error: any) {
      setError(error.message || 'Ошибка удаления');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!date) {
    return <div className="system-page-container">Дата не указана</div>;
  }

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">
          Редактирование дня: {formatDate(date)}
        </h1>
        
        <div className="admin-calendar-nav">
          <Link to="/admin/calendar" className="system-btn-outline">← Назад к календарю</Link>
        </div>

        {/* Сообщения */}
        {error && <div className="system-alert system-alert-error">{error}</div>}
        {success && <div className="system-alert system-alert-success">{success}</div>}

        {loading ? (
          <div className="system-alert system-alert-info">Загрузка...</div>
        ) : (
          <>
            {/* Святые дня */}
            <div className="system-content-card">
              <div className="card-header">
                <h2>Святые дня ({calendarDay?.saints.length || 0})</h2>
                <button 
                  className="system-btn-primary"
                  onClick={() => setShowSaintForm(!showSaintForm)}
                >
                  {showSaintForm ? 'Скрыть форму' : 'Добавить святого'}
                </button>
              </div>

              {showSaintForm && (
                <form onSubmit={handleAddSaint} className="system-form" style={{ marginBottom: '2rem' }}>
                  <div className="system-form-group">
                    <label className="system-form-label">Имя святого *</label>
                    <input
                      type="text"
                      value={saintForm.name}
                      onChange={(e) => setSaintForm(prev => ({ ...prev, name: e.target.value }))}
                      className="system-form-input"
                      required
                      placeholder="Например: Святитель Николай Чудотворец"
                    />
                  </div>

                  <div className="system-form-group">
                    <label className="system-form-label">Описание</label>
                    <textarea
                      value={saintForm.description}
                      onChange={(e) => setSaintForm(prev => ({ ...prev, description: e.target.value }))}
                      className="system-form-input"
                      rows={2}
                      placeholder="Краткое описание"
                    />
                  </div>

                  <div className="system-form-group">
                    <label className="system-form-label">Приоритет</label>
                    <select
                      value={saintForm.priority}
                      onChange={(e) => setSaintForm(prev => ({ ...prev, priority: e.target.value as SaintPriority }))}
                      className="system-form-input"
                    >
                      <option value={SaintPriority.COMMEMORATED}>Поминаемый</option>
                      <option value={SaintPriority.SIXTH_CLASS}>Шестеричный святой</option>
                      <option value={SaintPriority.VIGIL_SAINT}>Святой со всенощным бдением</option>
                      <option value={SaintPriority.POLYELEOS_SAINT}>Полиелейный святой</option>
                      <option value={SaintPriority.GREAT_SAINT}>Великий святой</option>
                    </select>
                  </div>

                  <div className="system-form-actions">
                    <button type="submit" className="system-btn-primary" disabled={loading}>
                      Добавить святого
                    </button>
                    <button 
                      type="button" 
                      className="system-btn-outline"
                      onClick={() => setShowSaintForm(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}

              <div className="saints-list">
                {calendarDay?.saints.length === 0 ? (
                  <div className="system-alert system-alert-info">
                    На этот день святые не добавлены
                  </div>
                ) : (
                  calendarDay?.saints.map(saint => (
                    <div key={saint.id} className="saint-card">
                      <div className="saint-info">
                        <h3 className="saint-name">{saint.name}</h3>
                        {saint.description && (
                          <p className="saint-description">{saint.description}</p>
                        )}
                        <div className="saint-priority">{saint.priority}</div>
                      </div>
                      <button 
                        className="system-btn-outline system-btn-sm system-btn-danger"
                        onClick={() => handleDeleteSaint(saint.id)}
                      >
                        Удалить
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Чтения дня */}
            <div className="system-content-card">
              <div className="card-header">
                <h2>Чтения дня ({calendarDay?.readings.length || 0})</h2>
                <button 
                  className="system-btn-primary"
                  onClick={() => setShowReadingForm(!showReadingForm)}
                >
                  {showReadingForm ? 'Скрыть форму' : 'Добавить чтение'}
                </button>
              </div>

              {showReadingForm && (
                <form onSubmit={handleAddReading} className="system-form" style={{ marginBottom: '2rem' }}>
                  <div className="system-form-row">
                    <div className="system-form-group">
                      <label className="system-form-label">Тип чтения *</label>
                      <select
                        value={readingForm.type}
                        onChange={(e) => setReadingForm(prev => ({ ...prev, type: e.target.value as ReadingType }))}
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
                        value={readingForm.order}
                        onChange={(e) => setReadingForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                        className="system-form-input"
                        min="0"
                      />
                    </div>
                  </div>

                  <div className="system-form-group">
                    <label className="system-form-label">Ссылка *</label>
                    <input
                      type="text"
                      value={readingForm.reference}
                      onChange={(e) => setReadingForm(prev => ({ ...prev, reference: e.target.value }))}
                      className="system-form-input"
                      required
                      placeholder="Например: Мф. 5:1-12"
                    />
                  </div>

                  <div className="system-form-group">
                    <label className="system-form-label">Заголовок</label>
                    <input
                      type="text"
                      value={readingForm.title}
                      onChange={(e) => setReadingForm(prev => ({ ...prev, title: e.target.value }))}
                      className="system-form-input"
                      placeholder="Краткое название"
                    />
                  </div>

                  <div className="system-form-actions">
                    <button type="submit" className="system-btn-primary" disabled={loading}>
                      Добавить чтение
                    </button>
                    <button 
                      type="button" 
                      className="system-btn-outline"
                      onClick={() => setShowReadingForm(false)}
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}

              <div className="readings-list">
                {calendarDay?.readings.length === 0 ? (
                  <div className="system-alert system-alert-info">
                    На этот день чтения не добавлены
                  </div>
                ) : (
                  calendarDay?.readings
                    .sort((a, b) => a.order - b.order)
                    .map(reading => (
                      <div key={reading.id} className="reading-card">
                        <div className="reading-info">
                          <div className="reading-type">{reading.type}</div>
                          <div className="reading-reference">{reading.reference}</div>
                          {reading.title && (
                            <div className="reading-title">{reading.title}</div>
                          )}
                          <div className="reading-order">Порядок: {reading.order}</div>
                        </div>
                        <button 
                          className="system-btn-outline system-btn-sm system-btn-danger"
                          onClick={() => handleDeleteReading(reading.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminCalendarDayPage;
