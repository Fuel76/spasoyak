/**
 * Простой тест функций дат
 */

// Копируем функции локально для тестирования
function formatDateSafe(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateSafe(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function extractDateFromISO(isoString) {
  const date = new Date(isoString);
  return formatDateSafe(date);
}

console.log('=== Тестирование утилит для работы с датами ===');

// Тест 1: Проверяем formatDateSafe
console.log('\n1. Тест formatDateSafe:');
const testDate = new Date(2024, 5, 12); // 12 июня 2024 (месяцы считаются с 0)
console.log(`Дата: ${testDate}`);
console.log(`formatDateSafe результат: ${formatDateSafe(testDate)}`);
console.log(`toISOString().slice(0,10): ${testDate.toISOString().slice(0, 10)}`);

// Тест 2: Проверяем parseDateSafe
console.log('\n2. Тест parseDateSafe:');
const dateString = '2024-06-12';
console.log(`Строка даты: ${dateString}`);
const parsedSafe = parseDateSafe(dateString);
const parsedUnsafe = new Date(dateString);
console.log(`parseDateSafe результат: ${parsedSafe}`);
console.log(`new Date() результат: ${parsedUnsafe}`);
console.log(`parseDateSafe день: ${parsedSafe.getDate()}`);
console.log(`new Date() день: ${parsedUnsafe.getDate()}`);

// Тест 3: Проверяем extractDateFromISO
console.log('\n3. Тест extractDateFromISO:');
const isoString = '2024-06-12T10:30:00.000Z';
console.log(`ISO строка: ${isoString}`);
console.log(`extractDateFromISO результат: ${extractDateFromISO(isoString)}`);

// Тест 4: Проверяем круговой цикл
console.log('\n4. Тест кругового цикла:');
const originalDate = new Date(2024, 5, 12);
const formatted = formatDateSafe(originalDate);
const backToParsed = parseDateSafe(formatted);
console.log(`Исходная дата: ${originalDate}`);
console.log(`После форматирования: ${formatted}`);
console.log(`После парсинга обратно: ${backToParsed}`);
console.log(`Дни равны: ${originalDate.getDate() === backToParsed.getDate()}`);
console.log(`Месяцы равны: ${originalDate.getMonth() === backToParsed.getMonth()}`);
console.log(`Годы равны: ${originalDate.getFullYear() === backToParsed.getFullYear()}`);

// Тест 5: Сравниваем старый и новый подходы
console.log('\n5. Демонстрация проблемы с часовыми поясами:');
const dateStr = '2024-06-12';
console.log(`Строка даты: ${dateStr}`);

// Старый подход (проблемный)
const oldWay = new Date(dateStr);
console.log(`Старый способ new Date("${dateStr}"): ${oldWay}`);
console.log(`Результат toISOString().slice(0,10): ${oldWay.toISOString().slice(0, 10)}`);
console.log(`Может дать не тот день: ${oldWay.getDate()}`);

// Новый подход (исправленный)
const newWay = parseDateSafe(dateStr);
console.log(`Новый способ parseDateSafe("${dateStr}"): ${newWay}`);
console.log(`Результат formatDateSafe: ${formatDateSafe(newWay)}`);
console.log(`Правильный день: ${newWay.getDate()}`);

console.log('\n=== Тесты завершены ===');
