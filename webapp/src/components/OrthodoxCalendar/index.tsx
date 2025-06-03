import React, { useState, useEffect } from 'react';
import { CalendarDay, DayPriority, FastingType } from '../../types/calendar';
import { ServiceIcon } from '../ServiceIcon';
import { formatDateSafe } from '../../utils/dateUtils';
import '../../styles/orthodox-calendar.css';

interface OrthodoxCalendarProps {
  onDateSelect?: (date: Date, day?: CalendarDay) => void;
  selectedDate?: Date;
  month?: number;
  year?: number;
}

export const OrthodoxCalendar: React.FC<OrthodoxCalendarProps> = ({
  onDateSelect,
  selectedDate,
  month = new Date().getMonth() + 1,
  year = new Date().getFullYear()
}) => {
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(month);
  const [currentYear, setCurrentYear] = useState(year);

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, currentYear]);

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/calendar/month/${currentYear}/${currentMonth}`);
      const data = await response.json();
      setCalendarDays(data);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDayPriorityColor = (priority: DayPriority): string => {
    switch (priority) {
      case DayPriority.GREAT_FEAST:
        return 'var(--great-feast-color, #dc2626)';
      case DayPriority.TWELVE_FEAST:
        return 'var(--twelve-feast-color, #f59e0b)';
      case DayPriority.POLYELEOS:
        return 'var(--polyeleos-color, #2563eb)';
      case DayPriority.VIGIL:
        return 'var(--vigil-color, #16a34a)';
      case DayPriority.SIXTH_CLASS:
        return 'var(--sixth-class-color, #374151)';
      default:
        return 'var(--normal-day-color, #000)';
    }
  };

  const getFastingIcon = (fastingType: FastingType): string => {
    switch (fastingType) {
      case FastingType.STRICT:
        return '🚫';
      case FastingType.FISH_ALLOWED:
        return '🐟';
      case FastingType.WINE_OIL:
        return '🍷';
      case FastingType.DRY_EATING:
        return '🌾';
      case FastingType.FULL_FAST:
        return '⛔';
      default:
        return '';
    }
  };

  const generateCalendarGrid = () => {
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; // Понедельник = 0

    const grid = [];
    
    // Пустые ячейки в начале
    for (let i = 0; i < startDay; i++) {
      grid.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = formatDateSafe(new Date(currentYear, currentMonth - 1, day));
      const calendarDay = calendarDays.find(d => d.date.startsWith(dateString));
      const isSelected = selectedDate && 
        selectedDate.getDate() === day && 
        selectedDate.getMonth() + 1 === currentMonth && 
        selectedDate.getFullYear() === currentYear;

      grid.push(
        <div
          key={day}
          className={`calendar-day ${isSelected ? 'selected' : ''} ${calendarDay?.isHoliday ? 'holiday' : ''}`}
          style={{
            color: calendarDay ? getDayPriorityColor(calendarDay.priority) : 'inherit',
            fontWeight: calendarDay?.isHoliday ? 'bold' : 'normal'
          }}
          onClick={() => {
            const date = new Date(currentYear, currentMonth - 1, day);
            onDateSelect?.(date, calendarDay);
          }}
        >
          <div className="day-number">{day}</div>
          
          {calendarDay && (
            <div className="day-info">
              {/* Иконка поста */}
              {calendarDay.fastingType !== FastingType.NONE && (
                <span className="fasting-icon" title={`Пост: ${calendarDay.fastingType}`}>
                  {getFastingIcon(calendarDay.fastingType)}
                </span>
              )}
              
              {/* Святые (сокращенно) */}
              {calendarDay.saints.length > 0 && (
                <div className="saints-brief" title={calendarDay.saints.map(s => s.name).join(', ')}>
                  {calendarDay.saints.length > 1 ? `${calendarDay.saints.length} свв.` : calendarDay.saints[0].name.split(' ')[0]}
                </div>
              )}
              
              {/* Иконки служб */}
              {calendarDay.schedules.length > 0 && (
                <div className="services-icons">
                  {calendarDay.schedules.slice(0, 3).map((schedule, index) => (
                    <ServiceIcon
                      key={index}
                      type={schedule.type}
                      priority={schedule.priority}
                      size="small"
                    />
                  ))}
                  {calendarDay.schedules.length > 3 && (
                    <span className="more-services">+{calendarDay.schedules.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }

    return grid;
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
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  return (
    <div className="orthodox-calendar">
      <div className="calendar-header">
        <button className="nav-button" onClick={() => navigateMonth(-1)}>
          ←
        </button>
        <h3>{monthNames[currentMonth - 1]} {currentYear}</h3>
        <button className="nav-button" onClick={() => navigateMonth(1)}>
          →
        </button>
      </div>

      <div className="calendar-grid">
        {/* Заголовки дней недели */}
        {weekDays.map(day => (
          <div key={day} className="weekday-header">
            {day}
          </div>
        ))}
        
        {/* Сетка календаря */}
        {loading ? (
          <div className="loading">Загрузка...</div>
        ) : (
          generateCalendarGrid()
        )}
      </div>

      {/* Легенда */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--great-feast-color, #dc2626)' }}></span>
          Великие праздники
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--twelve-feast-color, #f59e0b)' }}></span>
          Двунадесятые праздники
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--polyeleos-color, #2563eb)' }}></span>
          Полиелейные святые
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: 'var(--vigil-color, #16a34a)' }}></span>
          Всенощное бдение
        </div>
      </div>
    </div>
  );
};
