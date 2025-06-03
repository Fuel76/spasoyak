/**
 * Тест для проверки корректности работы с датами после исправлений
 */

import { formatDateSafe, parseDateSafe, extractDateFromISO } from '../src/utils/dateUtils';

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

console.log('\n=== Тесты завершены ===');
