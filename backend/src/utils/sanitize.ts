import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Создаём окружение DOM для DOMPurify
const window = new JSDOM('').window;
const purify = DOMPurify(window);

/**
 * Очищает HTML от потенциально опасного кода
 */
export const sanitizeHtml = (html: string): string => {
  // Настройка DOMPurify для безопасной очистки
  const config = {
    ADD_TAGS: ['iframe', 'video', 'audio', 'source', 'track'],
    ADD_ATTR: [
      'allowfullscreen', 'frameborder', 'controls', 'poster', 
      'target', 'rel', 'referrerpolicy', 'loading'
    ],
    // Запрещаем потенциально опасные теги
    FORBID_TAGS: ['script'],
    // Запрещаем встроенные скрипты в атрибутах
    FORBID_ATTR: [
      'onerror', 'onload', 'onunload', 'onclick', 'ondblclick',
      'onmousedown', 'onmouseup', 'onmouseover', 'onmousemove',
      'onmouseout', 'onkeypress', 'onkeydown', 'onkeyup'
    ]
  };
  
  // Очищаем HTML
  return purify.sanitize(html, config);
};

/**
 * Очищает CSS от потенциально опасных конструкций
 */
export const sanitizeCss = (css: string): string => {
  // Удаляем комментарии
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Удаляем @import из CSS
  css = css.replace(/@import\s+.+?;/g, '');
  
  // Запрещаем expression и другие опасные CSS функции
  css = css.replace(
    /(expression|javascript|behavior|eval|vbscript)\s*\(.*?\)/gi,
    'invalid()'
  );
  
  // Запрещаем url() с протоколами, кроме http/https
  css = css.replace(
    /url\s*\(\s*['"]?\s*(?!(https?:\/\/|\/\/|\/|data:image))[^'"\)]+\s*['"]?\s*\)/gi,
    'url("invalid")'
  );
  
  return css;
};