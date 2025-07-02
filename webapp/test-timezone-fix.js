// Тест для проверки исправления проблемы с часовыми поясами
// Этот тест проверяет, что наши функции работают корректно

const testCases = [
    '2025-06-12',
    '2025-12-25', 
    '2025-01-01',
    '2025-07-15'
];

console.log('=== Тест старого подхода (проблемный) ===');
testCases.forEach(dateStr => {
    const oldWay = new Date(dateStr);
    const oldFormatted = oldWay.toISOString().slice(0, 10);
    console.log(`Исходная дата: ${dateStr}`);
    console.log(`Старый способ: ${oldFormatted}`);
    console.log(`Проблема: ${dateStr !== oldFormatted ? 'ДА - дата сдвинулась!' : 'Нет'}`);
    console.log('---');
});

console.log('\n=== Тест нового подхода (исправленный) ===');

// Эмулируем наши функции
function formatDateSafe(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function parseDateSafe(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

testCases.forEach(dateStr => {
    const newWay = parseDateSafe(dateStr);
    const newFormatted = formatDateSafe(newWay);
    console.log(`Исходная дата: ${dateStr}`);
    console.log(`Новый способ: ${newFormatted}`);
    console.log(`Исправлено: ${dateStr === newFormatted ? 'ДА - дата сохраняется!' : 'НЕТ - еще есть проблема'}`);
    console.log('---');
});

console.log('\n=== Тест текущей даты ===');
const today = new Date();
console.log(`Сегодня (JavaScript): ${today.toDateString()}`);
console.log(`Сегодня (старый способ): ${today.toISOString().slice(0, 10)}`);
console.log(`Сегодня (новый способ): ${formatDateSafe(today)}`);
