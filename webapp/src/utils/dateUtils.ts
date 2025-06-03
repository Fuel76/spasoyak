/**
 * Утилиты для безопасной работы с датами.
 * Избегают проблем с временными зонами при конвертации дат.
 */

/**
 * Форматирует дату в строку YYYY-MM-DD без конвертации в UTC
 * @param date - объект Date для форматирования
 * @returns строка в формате YYYY-MM-DD
 */
export function formatDateSafe(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Создает объект Date из строки в формате YYYY-MM-DD
 * @param dateString - строка даты в формате YYYY-MM-DD
 * @returns объект Date
 */
export function parseDateSafe(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Извлекает дату из ISO строки без учета времени
 * @param isoString - ISO строка даты с временем
 * @returns строка в формате YYYY-MM-DD
 */
export function extractDateFromISO(isoString: string): string {
  // Используем Date для корректного парсинга ISO строки, 
  // затем форматируем безопасно
  const date = new Date(isoString);
  return formatDateSafe(date);
}

/**
 * Сравнивает две даты только по дню, месяцу и году
 * @param date1 - первая дата
 * @param date2 - вторая дата
 * @returns true если даты равны по дню
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDateSafe(date1) === formatDateSafe(date2);
}
