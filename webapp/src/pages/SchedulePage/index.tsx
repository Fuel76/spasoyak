import { useEffect, useState, useMemo, useRef } from 'react';
import OrthodoxCalendar from '../../components/OrthodoxCalendar';
import './SchedulePage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface ScheduleItem {
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description: string;
}

const SchedulePage = () => {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`${API_URL}/api/schedule`)
      .then(res => res.json())
      .then(data => setSchedule(Array.isArray(data) ? data : []))
      .catch(() => setSchedule([]))
      .finally(() => setLoading(false));
  }, []);

  // Список дат с событиями для календаря
  const eventDates = useMemo(() =>
    Array.from(new Set(schedule.map(ev => ev.date))),
    [schedule]
  );

  // Фильтрация событий по выбранной дате
  const filtered = useMemo(() => {
    if (!selectedDate) return schedule;
    const dateStr = selectedDate.toISOString().slice(0, 10);
    return schedule.filter(ev => ev.date === dateStr);
  }, [schedule, selectedDate]);

  return (
    <div className="system-page-container">
      <div className="system-page-content">
        <h1 className="system-page-title">Расписание богослужений</h1>
        
        <div className="system-content-card">
          <button
            className="system-btn-secondary"
            onClick={() => setCalendarVisible(v => !v)}
            aria-expanded={calendarVisible}
            aria-controls="calendar-block"
            style={{display: 'flex', alignItems: 'center', gap: 8, userSelect: 'none'}}
          >
            <span style={{fontWeight: 600}}>{calendarVisible ? 'Скрыть календарь' : 'Показать календарь'}</span>
            <svg width="18" height="18" style={{transition: 'transform 0.3s', transform: calendarVisible ? 'rotate(90deg)' : 'rotate(0deg)'}} viewBox="0 0 20 20"><polyline points="6 8 10 12 14 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          
          <div
            className={
              'schedule-calendar-block' + (calendarVisible ? ' spoiler-open' : ' hide')
            }
            id="calendar-block"
            ref={calendarRef}
            style={{transition: 'max-height 0.5s cubic-bezier(.23,1.01,.32,1), opacity 0.4s', maxHeight: calendarVisible ? 700 : 0, opacity: calendarVisible ? 1 : 0, overflow: 'hidden'}}
          >
            <OrthodoxCalendar
              showReadings
              showSaints
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate || undefined}
              eventDates={eventDates}
              className="orthodox-calendar--paper"
            />
          </div>
        </div>

        <div className="system-content-card">
          <h2 className="system-page-title">Ближайшие богослужения</h2>
          {loading ? (
            <div className="system-alert-info">Загрузка расписания...</div>
          ) : schedule.length === 0 ? (
            <div className="system-alert-warning">Расписание не добавлено. Уточняйте по телефону монастыря.</div>
          ) : (
            <>
              {selectedDate && (
                <div className="system-alert-info" style={{marginBottom: '1rem'}}>
                  <b>Выбрана дата: {selectedDate.toLocaleDateString('ru-RU')}</b>
                  <button className="system-btn-outline ml-3" onClick={() => setSelectedDate(null)}>
                    Показать все
                  </button>
                </div>
              )}
              {filtered.length === 0 ? (
                <div className="system-alert-warning">На выбранную дату нет богослужений.</div>
              ) : (
                <ul className="schedule-list">
                  {filtered
                    .sort((a, b) => a.time.localeCompare(b.time))
                    .map((item, i) => (
                      <li key={i} className="schedule-item">
                        <b>{item.date.split('-').reverse().join('.')}</b> {item.time} — {item.description}
                      </li>
                    ))}
                </ul>
              )}
            </>
          )}
          <p className="system-alert-info">* Актуальное расписание уточняйте по телефону монастыря.</p>
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;
