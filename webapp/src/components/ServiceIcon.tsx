import React from 'react';

// Типы служб
export type ServiceType = 'REGULAR' | 'LITURGY' | 'VESPERS' | 'MATINS' | 'MOLEBEN' | 'PANIKHIDA' | 'AKATHIST' | 'SPECIAL';

// Приоритеты служб
export type ServicePriority = 'NORMAL' | 'HOLIDAY' | 'SPECIAL';

interface ServiceIconProps {
  type?: ServiceType;
  priority?: ServicePriority;
  className?: string;
  title?: string;
  size?: string;
}

/**
 * Компонент для отображения иконки службы в зависимости от типа и приоритета
 * Использует эмодзи для визуального разделения служб по важности
 */
const ServiceIcon: React.FC<ServiceIconProps> = ({ 
  type = 'REGULAR', 
  priority = 'NORMAL', 
  className = '', 
  title,
  size 
}) => {
  // Получение иконки в зависимости от приоритета и типа
  const getServiceIcon = (): string => {
    // Приоритет определяет базовую иконку
    switch (priority) {
      case 'HOLIDAY':
        return '🟢'; // Зеленый круг для праздников
      case 'SPECIAL':
        return '📌'; // Красная булавка для особых служб
      case 'NORMAL':
      default:
        // Для обычных служб используем разные иконки в зависимости от типа
        switch (type) {
          case 'LITURGY':
            return '⚪'; // Белый круг для литургии
          case 'VESPERS':
            return '🌅'; // Закат для вечерни
          case 'MATINS':
            return '🌄'; // Рассвет для утрени
          case 'MOLEBEN':
            return '🙏'; // Молящиеся руки для молебна
          case 'PANIKHIDA':
            return '🕯️'; // Свеча для панихиды
          case 'AKATHIST':
            return '📿'; // Четки для акафиста
          case 'SPECIAL':
            return '✨'; // Звезда для особых служб
          case 'REGULAR':
          default:
            return '⚪'; // Белый круг для обычных служб
        }
    }
  };

  // Получение описания для tooltip
  const getServiceDescription = (): string => {
    if (title) return title;
    
    const descriptions: Record<ServicePriority, string> = {
      NORMAL: 'Обычная служба',
      HOLIDAY: 'Праздничная служба',
      SPECIAL: 'Особая служба'
    };
    
    return descriptions[priority];
  };

  return (
    <span 
      className={`service-icon ${size ? `service-icon--${size}` : ''} ${className}`.trim()}
      title={getServiceDescription()}
      role="img"
      aria-label={getServiceDescription()}
    >
      {getServiceIcon()}
    </span>
  );
};

export default ServiceIcon;
export { ServiceIcon };
