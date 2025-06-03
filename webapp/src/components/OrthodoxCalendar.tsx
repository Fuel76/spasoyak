import React, { useState, useEffect } from 'react';
import { ServiceIcon } from './ServiceIcon';
import { formatDateSafe } from '../utils/dateUtils';
import './OrthodoxCalendar.css';

function formatDate(date: Date) {
  // Используем безопасную утилиту для форматирования дат
  return formatDateSafe(date);
}

// Типы для календарных данных
interface Saint {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  priority: 'GREAT_SAINT' | 'POLYELEOS_SAINT' | 'VIGIL_SAINT' | 'SIXTH_CLASS' | 'COMMEMORATED';
}

interface Reading {
  id: number;
  type: 'APOSTLE' | 'GOSPEL' | 'OLD_TESTAMENT' | 'PROKEIMENON' | 'ALLELUIA';
  reference: string;
  title?: string;
  text?: string;
  order: number;
}

interface Schedule {
  id: number;
  time: string;
  title: string;
  description?: string;
  type: 'REGULAR' | 'LITURGY' | 'VESPERS' | 'MATINS' | 'MOLEBEN' | 'PANIKHIDA' | 'AKATHIST' | 'SPECIAL';
  priority: 'HOLIDAY' | 'SPECIAL' | 'NORMAL';
}

interface CalendarDay {
  id: number;
  date: string;
  priority: 'GREAT_FEAST' | 'TWELVE_FEAST' | 'POLYELEOS' | 'VIGIL' | 'SIXTH_CLASS' | 'NORMAL';
  fastingType: 'NONE' | 'STRICT' | 'FISH_ALLOWED' | 'WINE_OIL' | 'DRY_EATING' | 'FULL_FAST';
  isHoliday: boolean;
  color?: string;
  note?: string;
  saints: Saint[];
  readings: Reading[];
  schedules: Schedule[];
}

interface OrthodoxCalendarProps {
  showReadings?: boolean;
  showSaints?: boolean;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
  eventDates?: string[]; // YYYY-MM-DD
  className?: string;
  compact?: boolean; // Компактный режим для sidemenu
}

const OrthodoxCalendar: React.FC<OrthodoxCalendarProps> = ({ 
  showReadings = true, 
  showSaints = true, 
  onDateSelect, 
  selectedDate: externalSelectedDate, 
  eventDates = [], 
  className,
  compact = false 
}) => {
  const [internalDate, setInternalDate] = useState(new Date());
  const selectedDate = externalSelectedDate || internalDate;
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate.getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(selectedDate.getFullYear());
  const [compactTooltip, setCompactTooltip] = useState<{day: number, info: CalendarDay} | null>(null);

  // Загрузка данных календаря за месяц
  useEffect(() => {
    const fetchCalendarData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/calendar/month/${currentYear}/${currentMonth}`);
        const data = await response.json();
        setCalendarDays(data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
        setCalendarDays([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalendarData();
  }, [currentMonth, currentYear]);

  // Генерируем сетку дней текущего месяца
  const year = currentYear;
  const month = currentMonth - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const todayStr = formatDate(new Date());

  const days: (number | null)[] = Array(firstDay === 0 ? 6 : firstDay - 1).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const handleDayClick = (day: number | null) => {
    if (day) {
      const date = new Date(year, month, day);
      const calendarDay = calendarDays.find(cd => cd.date.startsWith(formatDate(date)));
      
      // В компактном режиме показываем tooltip с информацией
      if (compact && calendarDay) {
        setCompactTooltip(compactTooltip?.day === day ? null : { day, info: calendarDay });
        return;
      }
      
      if (!externalSelectedDate) {
        setInternalDate(date);
        setCurrentMonth(date.getMonth() + 1);
        setCurrentYear(date.getFullYear());
      }
      if (onDateSelect) onDateSelect(date);
    }
  };

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
    
    if (!externalSelectedDate) {
      const newDate = new Date(newYear, newMonth - 1, 1);
      setInternalDate(newDate);
    }
  };

  // Получить цвет дня по приоритету
  const getDayPriorityColor = (priority: CalendarDay['priority']): string => {
    switch (priority) {
      case 'GREAT_FEAST': return '#dc2626';
      case 'TWELVE_FEAST': return '#f59e0b';
      case 'POLYELEOS': return '#2563eb';
      case 'VIGIL': return '#16a34a';
      case 'SIXTH_CLASS': return '#374151';
      default: return '#000';
    }
  };

  // Получить иконку поста
  const getFastingIcon = (fastingType: CalendarDay['fastingType']): string => {
    switch (fastingType) {
      case 'STRICT': return '🚫';
      case 'FISH_ALLOWED': return '🐟';
      case 'WINE_OIL': return '🍷';
      case 'DRY_EATING': return '🌾';
      case 'FULL_FAST': return '⛔';
      default: return '';
    }
  };

  return (
    <div className={className ? `orthodox-calendar ${className}` : 'orthodox-calendar'}>
      <div className="calendar-header">
        <button onClick={() => navigateMonth(-1)}>&lt;</button>
        <span>{new Date(currentYear, currentMonth - 1).toLocaleString('ru-RU', { month: 'long', year: 'numeric' })}</span>
        <button onClick={() => navigateMonth(1)}>&gt;</button>
      </div>
      <div className="calendar-grid">
        {[ 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс' ].map(wd => <div key={wd} className="calendar-weekday">{wd}</div>)}
        {days.map((d, i) => {
          if (!d) return <div key={i} className="calendar-day empty"></div>;
          
          const dateStr = formatDate(new Date(year, month, d));
          const hasEvent = eventDates.includes(dateStr);
          const calendarDay = calendarDays.find(cd => cd.date.startsWith(dateStr));
          
          const isSelected = d === selectedDate.getDate() && 
                            month === selectedDate.getMonth() && 
                            year === selectedDate.getFullYear();
          const isToday = dateStr === todayStr;
          
          return (
            <div
              key={i}
              className={`calendar-day 
                ${isSelected ? ' selected' : ''} 
                ${isToday ? ' today' : ''}
                ${calendarDay?.isHoliday ? ' holiday' : ''}
              `.trim()}
              style={{
                color: calendarDay ? getDayPriorityColor(calendarDay.priority) : 'inherit',
                fontWeight: calendarDay?.isHoliday ? 'bold' : 'normal'
              }}
              onClick={() => handleDayClick(d)}
            >
              <div className="day-number">{d}</div>
              
              {/* Компактная информация о дне */}
              {calendarDay && !compact && (
                <div className="day-info">
                  {/* Иконка поста */}
                  {calendarDay.fastingType !== 'NONE' && (
                    <span className="fasting-icon" title={`Пост: ${calendarDay.fastingType}`}>
                      {getFastingIcon(calendarDay.fastingType)}
                    </span>
                  )}
                  
                  {/* Краткие святые */}
                  {calendarDay.saints.length > 0 && (
                    <div className="saints-brief" title={calendarDay.saints.map(s => s.name).join(', ')}>
                      {calendarDay.saints.length > 1 ? `${calendarDay.saints.length} свв.` : calendarDay.saints[0].name.split(' ')[0]}
                    </div>
                  )}
                  
                  {/* Иконки служб */}
                  {calendarDay.schedules.length > 0 && (
                    <div className="services-icons">
                      {calendarDay.schedules.slice(0, 2).map((schedule, index) => (
                        <ServiceIcon
                          key={index}
                          type={schedule.type}
                          priority={schedule.priority}
                          size="small"
                        />
                      ))}
                      {calendarDay.schedules.length > 2 && (
                        <span className="more-services">+{calendarDay.schedules.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Простая точка для компактного режима */}
              {compact && (hasEvent || calendarDay?.schedules.length) && (
                <span className="calendar-event-dot" title="Есть богослужение"></span>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Информация для выбранного дня */}
      {!compact && (
        <>
          {showSaints && (
            <div className="calendar-saints">
              <strong>Святцы:</strong>
              {loading ? (
                <div>Загрузка...</div>
              ) : (
                <ul>
                  {calendarDays
                    .find(cd => cd.date.startsWith(formatDate(selectedDate)))
                    ?.saints.map((saint, i) => (
                      <li key={i} title={saint.description}>
                        {saint.name}
                      </li>
                    )) || <li>Нет данных о святцах</li>
                  }
                </ul>
              )}
            </div>
          )}
          
          {showReadings && (
            <div className="calendar-readings">
              <strong>Чтения:</strong>
              {loading ? (
                <div>Загрузка...</div>
              ) : (
                <ul>
                  {calendarDays
                    .find(cd => cd.date.startsWith(formatDate(selectedDate)))
                    ?.readings.sort((a, b) => a.order - b.order)
                    .map((reading, i) => (
                      <li key={i} title={reading.title}>
                        {reading.reference}
                      </li>
                    )) || <li>Нет данных о чтениях</li>
                  }
                </ul>
              )}
            </div>
          )}
        </>
      )}
      
      {/* Компактный tooltip для sidemenu */}
      {compact && compactTooltip && (
        <div className="compact-tooltip">
          <div className="tooltip-header">
            <strong>{compactTooltip.day} {new Date(currentYear, currentMonth - 1).toLocaleString('ru-RU', { month: 'long' })}</strong>
            <button onClick={() => setCompactTooltip(null)}>×</button>
          </div>
          
          {compactTooltip.info.saints.length > 0 && (
            <div className="tooltip-saints">
              <strong>Святые:</strong>
              <ul>
                {compactTooltip.info.saints.slice(0, 3).map((saint, i) => (
                  <li key={i}>{saint.name}</li>
                ))}
                {compactTooltip.info.saints.length > 3 && (
                  <li>и еще {compactTooltip.info.saints.length - 3}</li>
                )}
              </ul>
            </div>
          )}
          
          {compactTooltip.info.readings.length > 0 && (
            <div className="tooltip-readings">
              <strong>Чтения:</strong>
              <ul>
                {compactTooltip.info.readings.slice(0, 2).map((reading, i) => (
                  <li key={i}>{reading.reference}</li>
                ))}
                {compactTooltip.info.readings.length > 2 && (
                  <li>и еще {compactTooltip.info.readings.length - 2}</li>
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrthodoxCalendar;
