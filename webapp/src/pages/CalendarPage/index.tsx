import React, { useState } from 'react';
import { OrthodoxCalendar } from '../../components/OrthodoxCalendar';
import { CalendarDayDetail } from '../../components/CalendarDayDetail';
import { CalendarDay } from '../../types/calendar';
import '../../styles/orthodox-calendar.css';

export const CalendarPage: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleDateSelect = (date: Date, day?: CalendarDay) => {
    setSelectedDate(date);
    setSelectedDay(day || null);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedDate(null);
    setSelectedDay(null);
  };

  return (
    <div className="calendar-page">
      <div className="page-header">
        <h1>Православный календарь</h1>
        <p>Выберите дату для просмотра святых, чтений и расписания служб</p>
      </div>

      <div className="calendar-container">
        <OrthodoxCalendar
          onDateSelect={handleDateSelect}
          selectedDate={selectedDate || undefined}
        />
      </div>

      {showDetail && selectedDate && (
        <div className="calendar-detail-modal">
          <div className="modal-backdrop" onClick={handleCloseDetail}></div>
          <div className="modal-content">
            <CalendarDayDetail
              calendarDay={selectedDay}
              date={selectedDate}
              onClose={handleCloseDetail}
            />
          </div>
        </div>
      )}

      <div className="calendar-info">
        <h2>О православном календаре</h2>
        <div className="info-grid">
          <div className="info-card">
            <h3>Цветовое кодирование</h3>
            <p>
              Дни в календаре окрашены согласно церковному уставу:
              красным отмечены великие праздники, золотым — двунадесятые праздники,
              синим — дни полиелейных святых, зеленым — дни всенощного бдения.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Посты и трапеза</h3>
            <p>
              Специальные значки показывают установленный пост:
              строгий пост, разрешение рыбы, вина и елея, сухоядение
              или полное воздержание от пищи.
            </p>
          </div>
          
          <div className="info-card">
            <h3>Расписание служб</h3>
            <p>
              Для каждого дня отображается расписание богослужений
              с указанием времени и типа службы. Иконки помогают
              быстро определить характер службы.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
