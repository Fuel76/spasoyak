import React, { useState, useEffect } from 'react';
// Удаляем старый CSS
// import './AdminSchedulePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ScheduleItem {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
}

const AdminSchedulePage: React.FC = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [form, setForm] = useState<ScheduleItem>({ date: '', time: '', description: '' });
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/schedule`)
      .then(res => res.json())
      .then(data => setSchedule(Array.isArray(data) ? data : []))
      .catch(() => setSchedule([]));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    setForm({ date: '', time: '', description: '' });
    setEditIndex(null);
  };

  const handleEdit = (i: number) => {
    setForm(schedule[i]);
    setEditIndex(i);
  };

  const handleDelete = (i: number) => {
    setSchedule(schedule.filter((_, idx) => idx !== i));
    if (editIndex === i) {
      setForm({ date: '', time: '', description: '' });
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
      const res = await fetch(`${API_URL}/api/schedule`, {
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
            <div className="system-form-actions">
              <button type="submit" className="system-btn-primary" disabled={loading}>
                {editIndex !== null ? 'Сохранить изменения' : 'Добавить'}
              </button>
              {editIndex !== null && (
                <button 
                  type="button" 
                  className="system-btn-secondary" 
                  onClick={() => { setForm({ date: '', time: '', description: '' }); setEditIndex(null); }}
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
            <div className="system-list">
              {schedule
                .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
                .map((item, i) => (
                  <div key={i} className="system-list-item">
                    <div className="system-flex-between">
                      <div>
                        <div className="system-text-bold">
                          {item.date.split('-').reverse().join('.')} в {item.time}
                        </div>
                        <div className="system-text-muted">{item.description}</div>
                      </div>
                      <div className="system-card-actions">
                        <button
                          className="system-btn-outline system-btn-sm"
                          onClick={() => handleEdit(i)}
                          title="Редактировать"
                        >
                          ✏️
                        </button>
                        <button
                          className="system-btn-outline system-btn-sm system-btn-danger"
                          onClick={() => window.confirm('Удалить это событие?') && handleDelete(i)}
                          title="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
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
