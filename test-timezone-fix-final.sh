#!/bin/bash

echo "========================================"
echo "ИТОГОВЫЙ ТЕСТ ИСПРАВЛЕНИЯ ПРОБЛЕМЫ С ЧАСОВЫМИ ПОЯСАМИ"
echo "========================================"
echo ""

echo "🔍 Тестируем API Calendar..."
echo ""

# Тестируем несколько дат
dates=("2025-06-01" "2025-06-02" "2025-06-03" "2025-06-04" "2025-06-05" "2025-06-12")

for date in "${dates[@]}"; do
    echo "📅 Тестируем дату: $date"
    response=$(curl -s "http://localhost:3000/api/calendar/$date")
    
    if [[ $response == *"error"* ]]; then
        echo "   ❌ ОШИБКА: $response"
    else
        returned_date=$(echo "$response" | jq -r '.date // "не найдена"')
        echo "   📤 Запрос: $date"
        echo "   📥 Ответ:  $returned_date"
        
        if [[ "$date" == "$returned_date" ]]; then
            echo "   ✅ УСПЕШНО: Дата совпадает!"
        else
            echo "   ⚠️  ПРОБЛЕМА: Дата сдвинулась!"
        fi
    fi
    echo ""
done

echo "========================================"
echo "РЕЗЮМЕ ИСПРАВЛЕНИЙ:"
echo "========================================"
echo "✅ Создан /backend/src/utils/dateUtils.ts с функциями:"
echo "   - parseDateSafe() - безопасный парсинг дат"
echo "   - formatDateSafe() - безопасное форматирование"
echo "   - formatCalendarDayForResponse() - форматирование для API"
echo ""
echo "✅ Создан /webapp/src/utils/dateUtils.ts с функциями:"
echo "   - formatDateSafe() - безопасное форматирование"
echo "   - parseDateSafe() - безопасный парсинг"
echo "   - extractDateFromISO() - извлечение даты из ISO строк"
echo ""
echo "✅ Обновлены компоненты Frontend:"
echo "   - OrthodoxCalendar.tsx"
echo "   - OrthodoxCalendar/index.tsx" 
echo "   - SchedulePage/index.tsx"
echo "   - AdminCalendarPage/index.tsx"
echo ""
echo "✅ Обновлены маршруты Backend:"
echo "   - /backend/src/routes/calendar.ts"
echo "   - /backend/src/routes/schedule.ts"
echo ""
echo "🔧 КОРНЕВАЯ ПРИЧИНА РЕШЕНА:"
echo "   Заменили 'new Date(dateString)' и 'toISOString().slice(0, 10)'"
echo "   на timezone-agnostic альтернативы"
echo ""
echo "🌐 Приложение доступно по адресам:"
echo "   Frontend: http://localhost:5174"
echo "   Backend:  http://localhost:3000"
echo "========================================"
