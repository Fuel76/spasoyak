import React, { useState, useEffect } from 'react';
import { CalendarEventV2 } from '../../types/treba-v2';
import { CalendarEventApiV2 } from '../../services/treba-api-v2';
import './AdminTrebyCalendarPage.css';
import '../../styles/system-pages.css';

const AdminTrebyCalendarPage: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventV2[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    loadEvents();
  }, [selectedMonth, selectedYear]);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const response = await CalendarEventApiV2.getByMonth(selectedYear, selectedMonth + 1);
      setEvents(response.data);
    } catch (err) {
      setError('Ошибка при загрузке событий календаря');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteEvent = async (eventId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это событие?')) {
      return;
    }

    try {
      await CalendarEventApiV2.delete(eventId);
      await loadEvents(); // Перезагружаем список
    } catch (err) {
      setError('Ошибка при удалении события');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '⛪';
      case 'prayer': return '🙏';
      case 'mass': return '✝️';
      default: return '📅';
    }
  };

  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  if (isLoading) {
    return (
      <div className="admin-page">
        <div className="loading">Загрузка календаря...</div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Календарь служб</h1>
        <p>Управление календарем церковных служб</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError(null)}>×</button>
        </div>
      )}

      <div className="calendar-controls">
        <div className="month-selector">
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          >
            {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="events-list">
        {events.length === 0 ? (
          <div className="empty-state">
            <p>События не найдены для выбранного периода</p>
          </div>
        ) : (
          <div className="events-table">
            <div className="table-header">
              <div className="table-cell">ID</div>
              <div className="table-cell">Треба ID</div>
              <div className="table-cell">Дата</div>
              <div className="table-cell">Тип</div>
              <div className="table-cell">Примечание</div>
              <div className="table-cell">Создано</div>
              <div className="table-cell">Действия</div>
            </div>
            
            {events.map((event) => (
              <div key={event.id} className="table-row">
                <div className="table-cell">{event.id}</div>
                <div className="table-cell">{event.trebaId}</div>
                <div className="table-cell">
                  <strong>{formatDateOnly(event.date)}</strong>
                </div>
                <div className="table-cell">
                  {getTypeIcon(event.type)} {event.type}
                </div>
                <div className="table-cell note-cell">
                  <div className="note-preview">
                    {event.note || '-'}
                  </div>
                </div>
                <div className="table-cell">{formatDate(event.createdAt)}</div>
                <div className="table-cell">
                  <button 
                    onClick={() => deleteEvent(event.id)}
                    className="btn-delete"
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
  );
};

export default AdminTrebyCalendarPage;
