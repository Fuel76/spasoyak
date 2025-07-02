import React, { useState, useEffect } from 'react';
import ServiceIcon, { ServiceType, ServicePriority } from '../../components/ServiceIcon';
// Удаляем старый CSS
// import './AdminSchedulePage.css';

const API_URL = import.meta.env.VITE_API_URL || '/api';

interface ScheduleItem {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
  type?: ServiceType;
  priority?: ServicePriority;
}

const AdminSchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState<ScheduleItem>({ 
    date: '', 
    time: '', 
    description: '', 
    type: 'regular', 
    priority: 'normal' 
  });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`/api/schedule`)
      .then(res => res.json())
      .then(data => setSchedule(Array.isArray(data) ? data : []))
      .catch(() => setSchedule([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddOrEdit = () => {
    if (!form.date || !form.time || !form.description) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    let newSchedule;
    if (editIndex !== null) {
      newSchedule = schedule.map((item, i) => (i === editIndex ? form : item));
    } else {
      newSchedule = [...schedule, form];
    }
    setSchedule(newSchedule);
    setForm({ date: '', time: '', description: '', type: 'regular', priority: 'normal' });
    setEditIndex(null);
  };

  const handleEdit = (i: number) => {
    setForm(schedule[i]);
    setEditIndex(i);
  };

  const handleDelete = (i: number) => {
    setSchedule(schedule.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setForm({ date: '', time: '', description: '', type: 'regular', priority: 'normal' });
      setEditIndex(null);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Получаем токен из localStorage
      const sessionData = localStorage.getItem('session');
      const token = sessionData ? JSON.parse(sessionData).token : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`/api/schedule`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ schedule })
      });
      if (!res.ok) throw new Error('Ошибка сохранения');
      setSuccess('Расписание обновлено!');
    } catch (e: any) {
      setError(e.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Редактировать расписание богослужений</h1>
        
        <div className="system-content-card">
          <form className="system-form-row" onSubmit={e => { e.preventDefault(); handleAddOrEdit(); }}>
            <div className="system-form-group">
              <label className="system-form-label">Дата</label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="system-form-input"
                required
              />
            </div>
            <div className="system-form-group">
              <label className="system-form-label">Время</label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className="system-form-input"
                required
              />
            </div>
            <div className="system-form-group system-flex-1">
              <label className="system-form-label">Описание</label>
              <input
                type="text"
                name="description"
                value={form.description}
                onChange={handleChange}
                className="system-form-input"
                placeholder="Описание (например: Литургия)"
                required
              />
            </div>
            <div className="system-form-group">
              <label className="system-form-label">Тип службы</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className="system-form-input"
              >
                <option value="regular">Обычная служба</option>
                <option value="liturgy">Литургия</option>
                <option value="vespers">Вечернее богослужение</option>
                <option value="moleben">Молебен</option>
                <option value="panikhida">Панихида</option>
                <option value="akathist">Акафист</option>
                <option value="special">Особая служба</option>
              </select>
            </div>
            <div className="system-form-group">
              <label className="system-form-label">Важность</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="system-form-input"
              >
                <option value="normal">Обычный день</option>
                <option value="holiday">Праздник</option>
                <option value="special">Особая служба</option>
              </select>
            </div>
            <div className="system-form-actions">
              <button type="submit" className="system-btn-primary" disabled={loading}>
                {editIndex !== null ? 'Сохранить изменения' : 'Добавить'}
              </button>
              {editIndex !== null && (
                <button 
                  type="button" 
                  className="system-btn-secondary" 
                  onClick={() => { setForm({ date: '', time: '', description: '', type: 'regular', priority: 'normal' }); setEditIndex(null); }}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>
          
          {success && <div className="system-alert system-alert-success">{success}</div>}
          {error && <div className="system-alert system-alert-error">{error}</div>}
        </div>
        
        <div className="system-content-card">
          <h2 className="system-card-title">Текущее расписание</h2>
          {schedule.length === 0 ? (
            <div className="system-alert system-alert-info">Нет событий. Добавьте первое богослужение.</div>
          ) : (
            <div className="admin-schedule-grouped">
              {Object.entries(
                schedule
                  .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                  .reduce((groups, item, index) => {
                    const dateKey = item.date;
                    if (!groups[dateKey]) groups[dateKey] = [];
                    groups[dateKey].push({ ...item, originalIndex: index });
                    return groups;
                  }, {} as Record<string, Array<ScheduleItem & { originalIndex: number }>>)
              ).map(([date, services]) => (
                <div key={date} className="admin-schedule-date-group">
                  <h3 className="admin-schedule-date-header">
                    {new Date(date).toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h3>
                  <div className="admin-services-list">
                    {services
                      .sort((a, b) => {
                        const priorityOrder = { holiday: 0, special: 1, normal: 2 };
                        const aPriority = priorityOrder[a.priority || 'normal'];
                        const bPriority = priorityOrder[b.priority || 'normal'];
                        
                        if (aPriority !== bPriority) {
                          return aPriority - bPriority;
                        }
                        
                        return a.time.localeCompare(b.time);
                      })
                      .map((item) => (
                        <div key={item.originalIndex} className={`admin-service-item service-item-${item.priority || 'normal'}`}>
                          <div className="admin-service-content">
                            <div className="admin-service-main">
                              <div className="admin-service-time-icon">
                                <ServiceIcon type={item.type || 'regular'} priority={item.priority || 'normal'} />
                                <span className="admin-service-time">{item.time}</span>
                              </div>
                              <div className="admin-service-info">
                                <div className="admin-service-description">{item.description}</div>
                                <div className="service-item-meta">
                                  <span className="service-type-badge">
                                    {item.type === 'liturgy' ? 'Литургия' :
                                     item.type === 'vespers' ? 'Вечернее богослужение' :
                                     item.type === 'moleben' ? 'Молебен' :
                                     item.type === 'panikhida' ? 'Панихида' :
                                     item.type === 'akathist' ? 'Акафист' :
                                     item.type === 'special' ? 'Особая служба' : 'Обычная служба'}
                                  </span>
                                  <span className={`service-priority-badge priority-${item.priority || 'normal'}`}>
                                    {item.priority === 'holiday' ? 'Праздник' :
                                     item.priority === 'special' ? 'Особая служба' : 'Обычный день'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="system-card-actions">
                              <button
                                className="system-btn-outline system-btn-sm"
                                onClick={() => handleEdit(item.originalIndex)}
                                title="Редактировать"
                              >
                                ✏️
                              </button>
                              <button
                                className="system-btn-outline system-btn-sm system-btn-danger"
                                onClick={() => window.confirm('Удалить это событие?') && handleDelete(item.originalIndex)}
                                title="Удалить"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="system-actions">
            <button 
              className="system-btn-primary" 
              onClick={handleSave} 
              disabled={loading || schedule.length === 0}
            >
              {loading ? 'Сохранение...' : 'Сохранить расписание'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSchedulePage;
