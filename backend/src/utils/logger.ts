import fs from 'fs';
import path from 'path';
import { format } from 'util';

// Типы уровней логирования
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// Интерфейс для настроек логгера
interface LoggerOptions {
  level: LogLevel;
  file?: string;
  console?: boolean;
  timestamp?: boolean;
}

/**
 * Класс для логирования в приложении
 */
export class Logger {
  private logLevel: LogLevel;
  private logFile?: string;
  private useConsole: boolean;
  private useTimestamp: boolean;
  
  // Карта весов уровней логирования для фильтрации
  private static readonly LOG_LEVELS_WEIGHTS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  /**
   * Конструктор Logger
   * @param options Настройки логгера
   */
  constructor(options: LoggerOptions) {
    this.logLevel = options.level || 'info';
    this.logFile = options.file;
    this.useConsole = options.console !== false;
    this.useTimestamp = options.timestamp !== false;
    
    // Создаем директорию для логов, если указан файл
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Форматирует сообщение лога
   * @param level Уровень логирования
   * @param args Аргументы для сообщения
   * @returns Отформатированное сообщение
   */
  private format(level: LogLevel, args: any[]): string {
    const message = format(...args);
    
    if (this.useTimestamp) {
      const timestamp = new Date().toISOString();
      return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    }
    
    return `[${level.toUpperCase()}] ${message}`;
  }

  /**
   * Записывает сообщение в лог
   * @param level Уровень логирования
   * @param args Аргументы для сообщения
   */
  private log(level: LogLevel, ...args: any[]): void {
    // Проверяем, нужно ли логировать этот уровень
    if (Logger.LOG_LEVELS_WEIGHTS[level] < Logger.LOG_LEVELS_WEIGHTS[this.logLevel]) {
      return;
    }

    const message = this.format(level, args);

    // Вывод в консоль, если включено
    if (this.useConsole) {
      switch (level) {
        case 'debug':
          console.debug(message);
          break;
        case 'info':
          console.info(message);
          break;
        case 'warn':
          console.warn(message);
          break;
        case 'error':
          console.error(message);
          break;
      }
    }

    // Запись в файл, если указан
    if (this.logFile) {
      fs.appendFileSync(this.logFile, message + '\n');
    }
  }

  /**
   * Логирование отладочной информации
   * @param args Аргументы для сообщения
   */
  public debug(...args: any[]): void {
    this.log('debug', ...args);
  }

  /**
   * Логирование информационного сообщения
   * @param args Аргументы для сообщения
   */
  public info(...args: any[]): void {
    this.log('info', ...args);
  }

  /**
   * Логирование предупреждения
   * @param args Аргументы для сообщения
   */
  public warn(...args: any[]): void {
    this.log('warn', ...args);
  }

  /**
   * Логирование ошибки
   * @param args Аргументы для сообщения
   */
  public error(...args: any[]): void {
    this.log('error', ...args);
  }
}

// Создаем экземпляр логгера по умолчанию
const defaultLoggerOptions: LoggerOptions = {
  level: (process.env.LOG_LEVEL as LogLevel) || 'info',
  file: process.env.LOG_FILE,
  console: process.env.LOG_CONSOLE !== 'false',
  timestamp: true
};

export const logger = new Logger(defaultLoggerOptions);
