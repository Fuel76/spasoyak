// Типы для православного календаря
export enum DayPriority {
  GREAT_FEAST = 'GREAT_FEAST',     // Великие праздники (красный)
  TWELVE_FEAST = 'TWELVE_FEAST',   // Двунадесятые праздники (золотой)
  POLYELEOS = 'POLYELEOS',         // Полиелейные святые (синий)
  VIGIL = 'VIGIL',                 // Всенощное бдение (зеленый)
  SIXTH_CLASS = 'SIXTH_CLASS',     // Шестеричные святые (черный)
  NORMAL = 'NORMAL'                // Обычные дни (черный)
}

export enum FastingType {
  NONE = 'NONE',                   // Нет поста
  STRICT = 'STRICT',               // Строгий пост
  FISH_ALLOWED = 'FISH_ALLOWED',   // Разрешена рыба
  WINE_OIL = 'WINE_OIL',          // Вино и елей
  DRY_EATING = 'DRY_EATING',       // Сухоядение
  FULL_FAST = 'FULL_FAST'          // Полное воздержание
}

export enum SaintPriority {
  GREAT_SAINT = 'GREAT_SAINT',         // Великий святой
  POLYELEOS_SAINT = 'POLYELEOS_SAINT', // Полиелейный святой
  VIGIL_SAINT = 'VIGIL_SAINT',         // Святой со всенощным бдением
  SIXTH_CLASS = 'SIXTH_CLASS',         // Шестеричный святой
  COMMEMORATED = 'COMMEMORATED'        // Поминаемый
}

export enum ReadingType {
  APOSTLE = 'APOSTLE',               // Апостольское чтение
  GOSPEL = 'GOSPEL',                 // Евангельское чтение
  OLD_TESTAMENT = 'OLD_TESTAMENT',   // Ветхозаветное чтение
  PROKEIMENON = 'PROKEIMENON',       // Прокимен
  ALLELUIA = 'ALLELUIA'              // Аллилуйя
}

export interface Saint {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  priority: SaintPriority;
  createdAt: string;
  updatedAt: string;
}

export interface Reading {
  id: number;
  type: ReadingType;
  reference: string;
  title?: string;
  text?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDay {
  id: number;
  date: string;
  priority: DayPriority;
  fastingType: FastingType;
  isHoliday: boolean;
  color?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
  saints: Saint[];
  readings: Reading[];
  schedules: ScheduleItem[];
}

export interface ScheduleItem {
  id: number;
  date: string;
  time: string;
  title: string;
  description?: string;
  type: ServiceType;
  priority: ServicePriority;
  isVisible: boolean;
  calendarDayId?: number;
  calendarDay?: CalendarDay;
  createdAt: string;
  updatedAt: string;
}
