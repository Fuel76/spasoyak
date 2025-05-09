import DOMPurify from 'dompurify';

/**
 * Очищает HTML от потенциально опасных элементов (XSS защита)
 */
export const sanitizeHtml = (html: string): string => {
  // Настройка DOMPurify для сохранения безопасных HTML элементов
  const purifyConfig = {
    ADD_TAGS: ['iframe', 'video', 'audio', 'source', 'track'],
    ADD_ATTR: ['allowfullscreen', 'frameborder', 'controls', 'poster'],
    FORBID_TAGS: ['script', 'style', 'form', 'input', 'textarea', 'select', 'button'],
    ALLOW_DATA_ATTR: false
  };
  
  return DOMPurify.sanitize(html, purifyConfig);
};

/**
 * Очищает CSS от потенциально опасных конструкций
 */
export const sanitizeCss = (css: string): string => {
  // Удаляем @import и url() с протоколами кроме http/https
  const cleanedCss = css
    .replace(/@import\s+["']?[^"')]+["']?/g, '') // Удалить все @import
    .replace(/url\(\s*['"]?\s*(?!data:)([^:'"]*?(?!https?:)[^'")]*)\s*['"]?\s*\)/g, 'url()') // Удалить недопустимые url()
    .replace(/<\/?[^>]+(>|$)/g, ''); // Удалить любые HTML-теги из CSS
    
  return cleanedCss;
};