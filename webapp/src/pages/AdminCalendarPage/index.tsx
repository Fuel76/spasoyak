import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDay } from '../../types/calendar';
import { formatDateSafe } from '../../utils/dateUtils';
import './AdminCalendar.css';

const AdminCalendarPage: React.FC = () => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [error, setError] = useState('');

  // Загрузка данных календаря
  const fetchCalendarData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/calendar/month/${currentYear}/${currentMonth}`);
      if (!response.ok) throw new Error('Ошибка загрузки данных');
      const data = await response.json();
      setCalendarDays(data);
    } catch (error: any) {
      setError(error.message || 'Ошибка загрузки');
      setCalendarDays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, currentYear]);

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    } else if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Управление православным календарем</h1>
        
        <div className="admin-calendar-nav">
          <Link to="/admin" className="system-btn-outline">← Назад в админку</Link>
          <div className="calendar-quick-links">
            <Link to="/admin/calendar/saints" className="system-btn-secondary">Управление святцами</Link>
            <Link to="/admin/calendar/readings" className="system-btn-secondary">Управление чтениями</Link>
          </div>
        </div>

        <div className="system-content-card">
          <div className="calendar-header">
            <button 
              className="system-btn-outline" 
              onClick={() => navigateMonth(-1)}
            >
              ←
            </button>
            <h2>{monthNames[currentMonth - 1]} {currentYear}</h2>
            <button 
              className="system-btn-outline" 
              onClick={() => navigateMonth(1)}
            >
              →
            </button>
          </div>

          {error && (
            <div className="system-alert system-alert-error">{error}</div>
          )}

          {loading ? (
            <div className="system-alert system-alert-info">Загрузка календаря...</div>
          ) : (
            <div className="admin-calendar-grid">
              <div className="calendar-weekdays">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                  <div key={day} className="weekday-header">{day}</div>
                ))}
              </div>
              
              <div className="calendar-days">
                {Array.from({ length: 42 }, (_, index) => {
                  const firstDay = new Date(currentYear, currentMonth - 1, 1).getDay();
                  const adjustedFirstDay = firstDay === 0 ? 7 : firstDay;
                  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
                  
                  const dayNumber = index - adjustedFirstDay + 2;
                  
                  if (dayNumber <= 0 || dayNumber > daysInMonth) {
                    return <div key={index} className="calendar-day empty"></div>;
                  }
                  
                  const dateString = formatDateSafe(new Date(currentYear, currentMonth - 1, dayNumber));
                  const calendarDay = calendarDays.find(d => d.date.startsWith(dateString));
                  
                  return (
                    <div key={index} className={`calendar-day ${calendarDay ? 'has-data' : ''}`}>
                      <div className="day-number">{dayNumber}</div>
                      
                      {calendarDay && (
                        <div className="day-data">
                          {calendarDay.saints.length > 0 && (
                            <div className="saints-count" title={`Святых: ${calendarDay.saints.length}`}>
                              👑 {calendarDay.saints.length}
                            </div>
                          )}
                          {calendarDay.readings.length > 0 && (
                            <div className="readings-count" title={`Чтений: ${calendarDay.readings.length}`}>
                              📖 {calendarDay.readings.length}
                            </div>
                          )}
                          {calendarDay.isHoliday && (
                            <div className="holiday-mark" title="Праздник">🎉</div>
                          )}
                        </div>
                      )}
                      
                      <Link 
                        to={`/admin/calendar/day/${dateString}`} 
                        className="edit-day-link"
                        title="Редактировать день"
                      >
                        ✏️
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="system-content-card">
          <h3>Статистика календаря</h3>
          <div className="calendar-stats">
            <div className="stat-item">
              <strong>Дней с данными:</strong> {calendarDays.length}
            </div>
            <div className="stat-item">
              <strong>Праздников:</strong> {calendarDays.filter(d => d.isHoliday).length}
            </div>
            <div className="stat-item">
              <strong>Всего святых:</strong> {calendarDays.reduce((sum, d) => sum + d.saints.length, 0)}
            </div>
            <div className="stat-item">
              <strong>Всего чтений:</strong> {calendarDays.reduce((sum, d) => sum + d.readings.length, 0)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCalendarPage;
