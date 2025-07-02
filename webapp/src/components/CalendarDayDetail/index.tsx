import React from 'react';
import { CalendarDay, DayPriority, FastingType, Saint, Reading } from '../../types/calendar';
import { ServiceIcon } from '../ServiceIcon';

interface CalendarDayDetailProps {
  calendarDay: CalendarDay | null;
  date: Date;
  onClose?: () => void;
}

export const CalendarDayDetail: React.FC<CalendarDayDetailProps> = ({
  calendarDay,
  date,
  onClose
}) => {
  if (!calendarDay && !date) return null;

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPriorityLabel = (priority: DayPriority): string => {
    switch (priority) {
      case DayPriority.GREAT_FEAST: return 'Великий праздник';
      case DayPriority.TWELVE_FEAST: return 'Двунадесятый праздник';
      case DayPriority.POLYELEOS: return 'Полиелейный святой';
      case DayPriority.VIGIL: return 'Всенощное бдение';
      case DayPriority.SIXTH_CLASS: return 'Шестеричный святой';
      default: return 'Обычный день';
    }
  };

  const getFastingLabel = (fastingType: FastingType): string => {
    switch (fastingType) {
      case FastingType.STRICT: return 'Строгий пост';
      case FastingType.FISH_ALLOWED: return 'Разрешена рыба';
      case FastingType.WINE_OIL: return 'Вино и елей';
      case FastingType.DRY_EATING: return 'Сухоядение';
      case FastingType.FULL_FAST: return 'Полное воздержание';
      default: return 'Пост не установлен';
    }
  };

  const getPriorityColor = (priority: DayPriority): string => {
    switch (priority) {
      case DayPriority.GREAT_FEAST: return '#dc2626';
      case DayPriority.TWELVE_FEAST: return '#f59e0b';
      case DayPriority.POLYELEOS: return '#2563eb';
      case DayPriority.VIGIL: return '#16a34a';
      case DayPriority.SIXTH_CLASS: return '#374151';
      default: return '#000';
    }
  };

  return (
    <div className="calendar-day-detail">
      <div className="detail-header">
        <h2 style={{ color: calendarDay ? getPriorityColor(calendarDay.priority) : '#000' }}>
          {formatDate(date)}
        </h2>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        )}
      </div>

      {calendarDay && (
        <>
          {/* Информация о дне */}
          <div className="day-summary">
            <div className="priority-badge" style={{ backgroundColor: getPriorityColor(calendarDay.priority) }}>
              {getPriorityLabel(calendarDay.priority)}
            </div>
            
            {calendarDay.fastingType !== FastingType.NONE && (
              <div className="fasting-badge">
                🍃 {getFastingLabel(calendarDay.fastingType)}
              </div>
            )}

            {calendarDay.note && (
              <div className="day-note">
                <strong>Примечание:</strong> {calendarDay.note}
              </div>
            )}
          </div>

          {/* Святые */}
          {calendarDay.saints.length > 0 && (
            <div className="saints-section">
              <h3>Святые дня</h3>
              <div className="saints-list">
                {calendarDay.saints.map((saint: Saint) => (
                  <div key={saint.id} className="saint-item">
                    {saint.icon && (
                      <img src={saint.icon} alt={saint.name} className="saint-icon" />
                    )}
                    <div className="saint-info">
                      <div className="saint-name">{saint.name}</div>
                      {saint.description && (
                        <div className="saint-description">{saint.description}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Чтения */}
          {calendarDay.readings.length > 0 && (
            <div className="readings-section">
              <h3>Чтения дня</h3>
              <div className="readings-list">
                {calendarDay.readings.map((reading: Reading) => (
                  <div key={reading.id} className="reading-item">
                    <div className="reading-type">
                      {reading.type === 'APOSTLE' && '📜 Апостольское чтение'}
                      {reading.type === 'GOSPEL' && '✠ Евангелие'}
                      {reading.type === 'OLD_TESTAMENT' && '📖 Ветхий Завет'}
                      {reading.type === 'PROKEIMENON' && '🎵 Прокимен'}
                      {reading.type === 'ALLELUIA' && '🎵 Аллилуйя'}
                    </div>
                    <div className="reading-reference">{reading.reference}</div>
                    {reading.title && (
                      <div className="reading-title">{reading.title}</div>
                    )}
                    {reading.text && (
                      <div className="reading-text">{reading.text}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Расписание служб */}
          {calendarDay.schedules.length > 0 && (
            <div className="schedule-section">
              <h3>Расписание служб</h3>
              <div className="schedule-list">
                {calendarDay.schedules.map((schedule) => (
                  <div key={schedule.id} className="schedule-item">
                    <div className="schedule-time">{schedule.time}</div>
                    <div className="schedule-service">
                      <ServiceIcon type={schedule.type} priority={schedule.priority} />
                      <div className="service-info">
                        <div className="service-title">{schedule.title}</div>
                        {schedule.description && (
                          <div className="service-description">{schedule.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {!calendarDay && (
        <div className="no-data">
          <p>Нет данных для этого дня</p>
          <p>Информация может быть добавлена администратором</p>
        </div>
      )}
    </div>
  );
};
