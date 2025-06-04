import express from 'express';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import archiver from 'archiver';
import { createReadStream } from 'fs';
import { authenticateToken, isAdmin } from '../middleware/auth';

const unzipper = require('unzipper');

const router = express.Router();
const execAsync = promisify(exec);

// Интерфейс для резервной копии
interface BackupFile {
  id: string;
  name: string;
  size: number;
  date: string;
  type: 'full' | 'partial';
  status: 'completed' | 'in_progress' | 'failed';
  path?: string;
}

// Путь к папке с резервными копиями
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Убедимся, что папка с бэкапами существует
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Получение списка резервных копий
 * GET /api/backup
 */
router.get('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backups: BackupFile[] = [];

    for (const file of files) {
      if (file.endsWith('.zip')) {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        
        // Парсим информацию из имени файла
        const match = file.match(/backup_(\d{4}-\d{2}-\d{2})_(\w+)_?\d*\.zip/);
        const type = match ? (match[2] as 'full' | 'partial') : 'full';
        
        backups.push({
          id: file,
          name: file,
          size: stats.size,
          date: stats.mtime.toISOString(),
          type,
          status: 'completed',
          path: filePath
        });
      }
    }

    // Сортируем по дате создания (новые сначала)
    backups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json(backups);
  } catch (error) {
    console.error('Ошибка получения списка резервных копий:', error);
    res.status(500).json({ error: 'Ошибка при получении списка резервных копий' });
  }
});

/**
 * Создание резервной копии
 * POST /api/backup/create
 */
router.post('/create', authenticateToken, isAdmin, async (req, res) => {
  let responseSent = false;
  
  try {
    const { type = 'full' } = req.body;
    const timestamp = new Date().toISOString().split('T')[0];
    const backupName = `backup_${timestamp}_${type}_${Date.now()}.zip`;
    const backupPath = path.join(BACKUP_DIR, backupName);

    console.log(`Начинаем создание бэкапа: ${backupName}`);

    // Создаем архив
    const output = fs.createWriteStream(backupPath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Максимальное сжатие
    });

    // Подключаем поток записи к архиву
    archive.pipe(output);

    // Обработка ошибок архива
    archive.on('error', (err) => {
      console.error('Ошибка архивирования:', err);
      if (!responseSent) {
        responseSent = true;
        res.status(500).json({ error: 'Ошибка при создании архива: ' + err.message });
      }
    });

    // Добавляем файлы в архив в зависимости от типа бэкапа
    if (type === 'full') {
      console.log('Создаем полный бэкап...');
      
      // Полная копия: база данных, загрузки, конфигурация
      const uploadsDir = path.join(process.cwd(), 'uploads');
      const configDir = path.join(process.cwd(), 'config');
      const prismaDir = path.join(process.cwd(), 'prisma');
      
      // Добавляем папку uploads если существует
      if (fs.existsSync(uploadsDir)) {
        console.log('Добавляем папку uploads...');
        archive.directory(uploadsDir, 'uploads');
      }
      
      // Добавляем папку config если существует
      if (fs.existsSync(configDir)) {
        console.log('Добавляем папку config...');
        archive.directory(configDir, 'config');
      }
      
      // Добавляем схему базы данных
      if (fs.existsSync(prismaDir)) {
        console.log('Добавляем папку prisma...');
        archive.directory(prismaDir, 'prisma');
      }
      
      // Добавляем файл package.json
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        console.log('Добавляем package.json...');
        archive.file(packageJsonPath, { name: 'package.json' });
      }
      
      // Добавляем .env файл (осторожно с конфиденциальными данными)
      const envPath = path.join(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        console.log('Добавляем .env файл...');
        archive.file(envPath, { name: '.env.backup' });
      }
      
    } else {
      console.log('Создаем частичный бэкап...');
      // Частичная копия: только критически важные файлы
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (fs.existsSync(uploadsDir)) {
        console.log('Добавляем папку uploads...');
        archive.directory(uploadsDir, 'uploads');
      }
    }

    // Добавляем метаданные о бэкапе
    const metadata = {
      type,
      timestamp: new Date().toISOString(),
      version: '1.0',
      created_by: 'monastyr_backup_system'
    };
    console.log('Добавляем метаданные...');
    archive.append(JSON.stringify(metadata, null, 2), { name: 'backup_metadata.json' });

    // Создаем Promise для ожидания завершения архивирования
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        console.log(`Архив завершен. Размер: ${archive.pointer()} байт`);
        resolve();
      });
      
      output.on('error', (err) => {
        console.error('Ошибка записи файла:', err);
        reject(err);
      });
      
      archive.on('warning', (err) => {
        if (err.code === 'ENOENT') {
          console.warn('Предупреждение архивирования:', err);
        } else {
          reject(err);
        }
      });
    });

    // Финализируем архив
    console.log('Финализируем архив...');
    await archive.finalize();

    // Ждем завершения записи
    await archivePromise;

    if (!responseSent) {
      const stats = fs.statSync(backupPath);
      const backup: BackupFile = {
        id: backupName,
        name: backupName,
        size: stats.size,
        date: new Date().toISOString(),
        type: type as 'full' | 'partial',
        status: 'completed'
      };

      console.log(`Резервная копия создана успешно: ${backupName}, размер: ${(stats.size / (1024 * 1024)).toFixed(2)} MB`);
      
      responseSent = true;
      res.json({ 
        message: 'Резервная копия успешно создана', 
        backup,
        sizeFormatted: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`
      });
    }
    
  } catch (error) {
    console.error('Ошибка создания резервной копии:', error);
    if (!responseSent) {
      responseSent = true;
      res.status(500).json({ error: 'Ошибка при создании резервной копии: ' + (error as Error).message });
    }
  }
});

/**
 * Скачивание резервной копии
 * GET /api/backup/download/:filename
 */
router.get('/download/:filename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл резервной копии не найден' });
    }

    // Проверяем, что файл находится в директории бэкапов (безопасность)
    const resolvedPath = path.resolve(filePath);
    const resolvedBackupDir = path.resolve(BACKUP_DIR);
    if (!resolvedPath.startsWith(resolvedBackupDir)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    res.download(filePath, filename);
  } catch (error) {
    console.error('Ошибка скачивания резервной копии:', error);
    res.status(500).json({ error: 'Ошибка при скачивании резервной копии' });
  }
});

/**
 * Удаление резервной копии
 * DELETE /api/backup/:filename
 */
router.delete('/:filename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл резервной копии не найден' });
    }

    // Проверяем, что файл находится в директории бэкапов (безопасность)
    const resolvedPath = path.resolve(filePath);
    const resolvedBackupDir = path.resolve(BACKUP_DIR);
    if (!resolvedPath.startsWith(resolvedBackupDir)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    fs.unlinkSync(filePath);
    res.json({ message: 'Резервная копия успешно удалена' });
  } catch (error) {
    console.error('Ошибка удаления резервной копии:', error);
    res.status(500).json({ error: 'Ошибка при удалении резервной копии' });
  }
});

/**
 * Восстановление из резервной копии
 * POST /api/backup/restore/:filename
 */
router.post('/restore/:filename', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(BACKUP_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Файл резервной копии не найден' });
    }

    // Проверяем, что файл находится в директории бэкапов (безопасность)
    const resolvedPath = path.resolve(filePath);
    const resolvedBackupDir = path.resolve(BACKUP_DIR);
    if (!resolvedPath.startsWith(resolvedBackupDir)) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }

    // Создаем временную папку для восстановления
    const tempRestoreDir = path.join(BACKUP_DIR, 'temp_restore_' + Date.now());
    fs.mkdirSync(tempRestoreDir, { recursive: true });

    try {
      // Распаковываем архив
      await new Promise<void>((resolve, reject) => {
        createReadStream(filePath)
          .pipe(unzipper.Extract({ path: tempRestoreDir }))
          .on('close', () => resolve())
          .on('error', reject);
      });

      // Проверяем метаданные восстановления
      const metadataPath = path.join(tempRestoreDir, 'backup_metadata.json');
      let metadata = null;
      if (fs.existsSync(metadataPath)) {
        const metadataContent = fs.readFileSync(metadataPath, 'utf8');
        metadata = JSON.parse(metadataContent);
        console.log('Метаданные резервной копии:', metadata);
      }

      // Восстанавливаем файлы
      const uploadsBackupPath = path.join(tempRestoreDir, 'uploads');
      const uploadsTargetPath = path.join(process.cwd(), 'uploads');
      
      if (fs.existsSync(uploadsBackupPath)) {
        // Создаем резервную копию текущей папки uploads
        const currentUploadsBackup = path.join(BACKUP_DIR, `uploads_backup_before_restore_${Date.now()}`);
        if (fs.existsSync(uploadsTargetPath)) {
          await execAsync(`cp -r "${uploadsTargetPath}" "${currentUploadsBackup}"`);
          console.log(`Создана резервная копия текущих uploads: ${currentUploadsBackup}`);
        }
        
        // Восстанавливаем uploads
        await execAsync(`cp -r "${uploadsBackupPath}" "${path.dirname(uploadsTargetPath)}"`);
        console.log('Папка uploads восстановлена');
      }

      // Очищаем временную папку
      fs.rmSync(tempRestoreDir, { recursive: true, force: true });

      res.json({ 
        message: 'Восстановление из резервной копии успешно завершено',
        metadata,
        restored: {
          uploads: fs.existsSync(uploadsBackupPath),
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (extractError) {
      // Очищаем временную папку в случае ошибки
      if (fs.existsSync(tempRestoreDir)) {
        fs.rmSync(tempRestoreDir, { recursive: true, force: true });
      }
      throw extractError;
    }
    
  } catch (error) {
    console.error('Ошибка восстановления из резервной копии:', error);
    res.status(500).json({ error: 'Ошибка при восстановлении из резервной копии' });
  }
});

export default router;
