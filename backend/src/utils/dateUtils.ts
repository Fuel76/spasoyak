/**
 * Утилиты для безопасной работы с датами в бэкенде.
 * Избегают проблем с временными зонами при парсинге строк дат.
 */

/**
 * Безопасно парсит строку даты в формате YYYY-MM-DD в объект Date
 * в UTC полночь для стабильного сравнения в базе данных
 * @param dateString - строка даты в формате YYYY-MM-DD
 * @returns объект Date в UTC
 */
export function parseDateSafe(dateString: string): Date {
  return new Date(dateString + 'T00:00:00.000Z');
}

/**
 * Парсит дату старым способом (UTC) для совместимости с существующими данными
 * @param dateString - строка даты в формате YYYY-MM-DD
 * @returns объект Date в UTC
 */
export function parseDateUTC(dateString: string): Date {
  return new Date(dateString);
}

/**
 * Форматирует объект Date в строку YYYY-MM-DD 
 * без учета часового пояса
 * @param date - объект Date
 * @returns строка в формате YYYY-MM-DD
 */
export function formatDateSafe(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Проверяет, является ли строка валидной датой в формате YYYY-MM-DD
 * @param dateString - строка для проверки
 * @returns true если строка является валидной датой
 */
export function isValidDateString(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;
  
  const date = parseDateSafe(dateString);
  return formatDateSafe(date) === dateString;
}

/**
 * Преобразует данные календарного дня для безопасной отправки клиенту
 * @param calendarDay - объект календарного дня из базы данных
 * @returns объект с правильно отформатированной датой
 */
export function formatCalendarDayForResponse(calendarDay: any) {
  return {
    ...calendarDay,
    date: formatDateSafe(calendarDay.date),
    // Также форматируем даты в связанных объектах если они есть
    saints: calendarDay.saints?.map((saint: any) => ({
      ...saint,
      date: saint.date ? formatDateSafe(saint.date) : saint.date
    })),
    schedules: calendarDay.schedules?.map((schedule: any) => ({
      ...schedule,
      date: schedule.date ? formatDateSafe(schedule.date) : schedule.date
    }))
  };
}
