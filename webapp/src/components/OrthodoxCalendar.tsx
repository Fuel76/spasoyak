import React, { useState, useEffect } from 'react';
import './OrthodoxCalendar.css';

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

const fallbackSaints: Record<string, string[]> = {
  '2025-05-23': ['Свт. Михаила, митр. Киевского', 'Прп. Михаила Малеина'],
  '2025-05-24': ['Равноап. Кирилла и Мефодия'],
  '2025-05-25': ['Свт. Епифания Кипрского'],
};
const fallbackReadings: Record<string, string[]> = {
  '2025-05-23': ['Деян. 15:5-34', 'Ин. 10:17-28'],
  '2025-05-24': ['Деян. 16:1-10', 'Ин. 10:27-38'],
  '2025-05-25': ['Деян. 16:16-34', 'Ин. 9:1-38'],
};

interface OrthodoxCalendarProps {
  showReadings?: boolean;
  showSaints?: boolean;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  eventDates?: string[]; // YYYY-MM-DD
  className?: string;
}

const OrthodoxCalendar: React.FC<OrthodoxCalendarProps> = ({ showReadings = true, showSaints = true, onDateSelect, selectedDate: externalSelectedDate, eventDates = [], className }) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const selectedDate = externalSelectedDate || internalDate;
  const [saints, setSaints] = useState<string[]>([]);
  const [readings, setReadings] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Генерируем сетку дней текущего месяца
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = formatDate(new Date());

  const days: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleDayClick = (day: number | null) => {
    if (day) {
      const date = new Date(year, month, day);
      if (!externalSelectedDate) setInternalDate(date);
      if (onDateSelect) onDateSelect(date);
    }
  };

  // Загрузка реальных данных святцев и чтений
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const dateStr = formatDate(selectedDate);
      try {
        // Используем backend-прокси вместо прямого запроса
        const resp = await fetch(`/api/orthodox-day/${dateStr}`);
        if (!resp.ok) {
          setSaints(['Нет данных о святцах']);
          setReadings(['Нет данных о чтениях']);
          setLoading(false);
          return;
        }
        const data = await resp.json();
        console.log('Ответ с backend /api/orthodox-day:', data); // [DEBUG]
        // Святцы
        const saintsArr = (data.saints || []).map((s: any) => s.title || s.name || s.text || s).filter(Boolean);
        setSaints(saintsArr.length ? saintsArr : ['Нет данных о святцах']);
        // Чтения
        const readingsArr = (data.readings || []).map((r: any) => r.title || r.text || r).filter(Boolean);
        setReadings(readingsArr.length ? readingsArr : ['Нет данных о чтениях']);
      } catch {
        setSaints(fallbackSaints[dateStr] || ['Нет данных о святцах']);
        setReadings(fallbackReadings[dateStr] || ['Нет данных о чтениях']);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedDate]);

  return (
    <div className={className ? `orthodox-calendar ${className}` : 'orthodox-calendar'}>
      <div className="calendar-header">
        <button onClick={() => {
          const prevMonth = new Date(year, month - 1, 1);
          if (!externalSelectedDate) setInternalDate(prevMonth);
          if (onDateSelect) onDateSelect(prevMonth);
        }}>&lt;</button>
        <span>{selectedDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => {
          const nextMonth = new Date(year, month + 1, 1);
          if (!externalSelectedDate) setInternalDate(nextMonth);
          if (onDateSelect) onDateSelect(nextMonth);
        }}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {[ 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс' ].map(wd => <div key={wd} className="calendar-weekday">{wd}</div>)}
        {days.map((d, i) => {
          if (!d) return <div key={i} className="calendar-day empty"></div>;
          const dateStr = formatDate(new Date(year, month, d));
          const hasEvent = eventDates.includes(dateStr);
          return (
            <div
              key={i}
              className={
                'calendar-day' +
                (d === selectedDate.getDate() && month === selectedDate.getMonth() && year === selectedDate.getFullYear() ? ' selected' : '') +
                (formatDate(new Date(year, month, d)) === todayStr ? ' today' : '')
              }
              onClick={() => handleDayClick(d)}
            >
              {d}
              {hasEvent && <span className="calendar-event-dot" title="Есть богослужение"></span>}
            </div>
          );
        })}
      </div>
      {showSaints && (
        <div className="calendar-saints">
          <strong>Святцы:</strong>
          {loading ? <div>Загрузка...</div> : <ul>{saints.map((s, i) => <li key={i}>{s}</li>)}</ul>}
        </div>
      )}
      {showReadings && (
        <div className="calendar-readings">
          <strong>Чтения:</strong>
          {loading ? <div>Загрузка...</div> : <ul>{readings.map((r, i) => <li key={i}>{r}</li>)}</ul>}
        </div>
      )}
    </div>
  );
};

export default OrthodoxCalendar;
