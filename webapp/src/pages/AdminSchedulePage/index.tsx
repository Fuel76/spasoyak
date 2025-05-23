import React, { useState, useEffect } from 'react';
import './AdminSchedulePage.css';

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
    <div className="admin-schedule-container">
      <h1>Редактировать расписание богослужений</h1>
      <form className="admin-schedule-form" onSubmit={e => { e.preventDefault(); handleAddOrEdit(); }} style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'center',marginBottom:24}}>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="admin-schedule-input"
          required
          style={{minWidth:140}}
        />
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          className="admin-schedule-input"
          required
          style={{minWidth:100}}
        />
        <input
          type="text"
          name="description"
          value={form.description}
          onChange={handleChange}
          className="admin-schedule-input"
          placeholder="Описание (например: Литургия)"
          required
          style={{flex:1,minWidth:220}}
        />
        <button type="submit" className="admin-schedule-save-btn" disabled={loading} style={{minWidth:120}}>
          {editIndex !== null ? 'Сохранить изменения' : 'Добавить'}
        </button>
        {editIndex !== null && (
          <button type="button" className="admin-schedule-cancel-btn" style={{minWidth:90}} onClick={() => { setForm({ date: '', time: '', description: '' }); setEditIndex(null); }}>
            Отмена
          </button>
        )}
      </form>
      {success && <div className="admin-schedule-success" style={{marginBottom:12}}>{success}</div>}
      {error && <div className="admin-schedule-error" style={{marginBottom:12}}>{error}</div>}
      <div className="admin-schedule-preview">
        <h2 style={{marginBottom:16}}>Текущее расписание:</h2>
        {schedule.length === 0 ? (
          <div style={{color:'#888',margin:'16px 0'}}>Нет событий. Добавьте первое богослужение.</div>
        ) : (
          <div className="admin-schedule-list">
            {schedule
              .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time))
              .map((item, i) => (
                <div key={i} className="admin-schedule-card">
                  <div className="admin-schedule-card-date">
                    <span>{item.date.split('-').reverse().join('.')}</span>
                    <span style={{marginLeft:8}}>{item.time}</span>
                  </div>
                  <div className="admin-schedule-card-desc">{item.description}</div>
                  <div className="admin-schedule-card-actions">
                    <button title="Редактировать" className="admin-schedule-edit-btn" onClick={() => handleEdit(i)}>
                      ✏️
                    </button>
                    <button title="Удалить" className="admin-schedule-delete-btn" onClick={() => window.confirm('Удалить это событие?') && handleDelete(i)}>
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
        <button className="admin-schedule-save-btn" onClick={handleSave} disabled={loading || schedule.length === 0} style={{marginTop: 24,minWidth:180}}>
          {loading ? 'Сохранение...' : 'Сохранить расписание'}
        </button>
      </div>
      <style>{`
        .admin-schedule-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .admin-schedule-card {
          background: #f8fafc;
          border-radius: 10px;
          box-shadow: 0 1px 6px rgba(120,110,90,0.07);
          padding: 16px 18px;
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .admin-schedule-card-date {
          font-weight: 600;
          color: #2a4d8f;
          min-width: 120px;
        }
        .admin-schedule-card-desc {
          flex: 1;
          color: #333;
          font-size: 1.08rem;
        }
        .admin-schedule-card-actions {
          display: flex;
          gap: 8px;
        }
        .admin-schedule-edit-btn, .admin-schedule-delete-btn {
          background: #e3eafc;
          border: none;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 1.1rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .admin-schedule-edit-btn:hover {
          background: #cce5ff;
        }
        .admin-schedule-delete-btn:hover {
          background: #ffd6d6;
        }
        @media (max-width: 600px) {
          .admin-schedule-card {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
          .admin-schedule-form {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSchedulePage;
