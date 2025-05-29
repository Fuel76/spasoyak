# React + TypeScript + Vite

Веб-приложение для Спасо-Яковлевского Димитриева монастыря

## Последние обновления

### Замена текстовых кнопок на SVG иконки

- Заменены текстовые кнопки "Расписание Богослужений" и "Требы" на соответствующие SVG изображения
- Обновлены стили кнопок для работы с иконками
- Увеличен размер иконок для лучшей видимости
- Сохранена анимация при наведении

### Страница "О монастыре"

- Создана полная страница с информацией о монастыре (`/about`)
- Обновленная информация о управлении монастырем (вместо конкретных персональных данных)
- Раздел о монашеской жизни с карточками различных аспектов
- Информация о структуре братии
- Сведения о святынях и храмах
- Контактная информация и режим работы
- Адаптивный дизайн для мобильных устройств
- Цветовая схема соответствует общему дизайну сайта (бежево-коричневая палитра)
- Плавные анимации появления элементов

### Улучшения дизайна

- Обновлена цветовая палитра для соответствия основной теме монастыря
- Добавлены градиенты и тени для современного вида
- Улучшена типографика и читаемость
- Добавлены православные символы в иконках

## Технические детали

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
