import React, { useEffect, useState, useMemo } from 'react';
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
    <div className="schedule-page-container">
      <h1 className="schedule-title">Расписание богослужений</h1>
      <div className="schedule-calendar-block">
        <OrthodoxCalendar
          showReadings
          showSaints
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate || undefined}
          eventDates={eventDates}
        />
      </div>
      <div className="schedule-info-block">
        <h2>Ближайшие богослужения</h2>
        {loading ? (
          <div>Загрузка расписания...</div>
        ) : schedule.length === 0 ? (
          <div>Расписание не добавлено. Уточняйте по телефону монастыря.</div>
        ) : (
          <>
            {selectedDate && (
              <div style={{marginBottom: 10}}>
                <b>Выбрана дата: {selectedDate.toLocaleDateString('ru-RU')}</b>
                <button style={{marginLeft: 12}} className="schedule-reset-btn" onClick={() => setSelectedDate(null)}>
                  Показать все
                </button>
              </div>
            )}
            {filtered.length === 0 ? (
              <div>На выбранную дату нет богослужений.</div>
            ) : (
              <ul className="schedule-list">
                {filtered
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((item, i) => (
                    <li key={i}>
                      <b>{item.date.split('-').reverse().join('.')}</b> {item.time} — {item.description}
                    </li>
                  ))}
              </ul>
            )}
          </>
        )}
        <p className="schedule-note">* Актуальное расписание уточняйте по телефону монастыря.</p>
      </div>
    </div>
  );
};

export default SchedulePage;
