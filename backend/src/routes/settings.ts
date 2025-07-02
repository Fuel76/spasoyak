import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// Интерфейс настроек системы
interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  maxUploadSize: number;
  enableRegistration: boolean;
  enableComments: boolean;
  maintenanceMode: boolean;
  emailNotifications: boolean;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  timeZone: string;
  language: string;
  theme: 'light' | 'dark' | 'auto';
}

// Путь к файлу настроек
const SETTINGS_FILE = path.join(process.cwd(), 'config', 'settings.json');

// Создаем папку config если она не существует
const configDir = path.dirname(SETTINGS_FILE);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

// Настройки по умолчанию
const defaultSettings: SystemSettings = {
  siteName: 'Православный монастырь',
  siteDescription: 'Официальный сайт православного монастыря',
  contactEmail: 'info@monastery.ru',
  contactPhone: '+7 (800) 123-45-67',
  address: 'Россия, Московская область',
  maxUploadSize: 10,
  enableRegistration: true,
  enableComments: true,
  maintenanceMode: false,
  emailNotifications: true,
  backupFrequency: 'daily',
  timeZone: 'Europe/Moscow',
  language: 'ru',
  theme: 'light'
};

// Функция для загрузки настроек
const loadSettings = (): SystemSettings => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf8');
      const settings = JSON.parse(data);
      // Объединяем с настройками по умолчанию на случай новых полей
      return { ...defaultSettings, ...settings };
    }
    return defaultSettings;
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error);
    return defaultSettings;
  }
};

// Функция для сохранения настроек
const saveSettings = (settings: SystemSettings): void => {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf8');
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    throw new Error('Не удалось сохранить настройки');
  }
};

/**
 * Получение текущих настроек
 * GET /api/settings
 */
router.get('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const settings = loadSettings();
    res.json(settings);
  } catch (error) {
    console.error('Ошибка получения настроек:', error);
    res.status(500).json({ error: 'Ошибка при получении настроек' });
  }
});

/**
 * Обновление настроек
 * PUT /api/settings
 */
router.put('/', authenticateToken, isAdmin, (req, res) => {
  try {
    const newSettings: SystemSettings = req.body;
    
    // Валидация настроек
    if (!newSettings.siteName?.trim()) {
      return res.status(400).json({ error: 'Название сайта обязательно' });
    }
    
    if (!newSettings.contactEmail?.trim()) {
      return res.status(400).json({ error: 'Email обязателен' });
    }
    
    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newSettings.contactEmail)) {
      return res.status(400).json({ error: 'Некорректный формат email' });
    }
    
    // Валидация размера загрузки
    if (newSettings.maxUploadSize < 1 || newSettings.maxUploadSize > 100) {
      return res.status(400).json({ error: 'Размер загрузки должен быть от 1 до 100 МБ' });
    }
    
    // Валидация частоты резервного копирования
    const validFrequencies = ['daily', 'weekly', 'monthly'];
    if (!validFrequencies.includes(newSettings.backupFrequency)) {
      return res.status(400).json({ error: 'Некорректная частота резервного копирования' });
    }
    
    // Валидация темы
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(newSettings.theme)) {
      return res.status(400).json({ error: 'Некорректная тема' });
    }
    
    // Сохраняем настройки
    saveSettings(newSettings);
    
    res.json({ 
      message: 'Настройки успешно сохранены',
      settings: newSettings
    });
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
    res.status(500).json({ error: 'Ошибка при сохранении настроек' });
  }
});

/**
 * Сброс настроек к значениям по умолчанию
 * POST /api/settings/reset
 */
router.post('/reset', authenticateToken, isAdmin, (req, res) => {
  try {
    saveSettings(defaultSettings);
    res.json({ 
      message: 'Настройки сброшены к значениям по умолчанию',
      settings: defaultSettings
    });
  } catch (error) {
    console.error('Ошибка сброса настроек:', error);
    res.status(500).json({ error: 'Ошибка при сбросе настроек' });
  }
});

/**
 * Получение системной информации
 * GET /api/settings/system-info
 */
router.get('/system-info', authenticateToken, isAdmin, (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      pid: process.pid,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Ошибка получения системной информации:', error);
    res.status(500).json({ error: 'Ошибка при получении системной информации' });
  }
});

export default router;
