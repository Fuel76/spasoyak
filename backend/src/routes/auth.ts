import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { Secret } from 'jsonwebtoken';
import { db } from '../utils/db';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router(); 

// Стандартный JWT timeout - 30 дней
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

/**
 * Создание JWT токена
 */
function createToken(user: any): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET отсутствует');
  }

  // Преобразуем строку в Buffer, что может решить проблему типизации
  const secretBuffer = Buffer.from(secret, 'utf8');
  
  return jwt.sign(
    { userId: user.id, email: user.email },
    secretBuffer,
    { expiresIn: '30d' }
  );
}

/**
 * Регистрация пользователя
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email и пароль обязательны'
      });
    }

    // Проверка существующего пользователя
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'user' // По умолчанию обычный пользователь
      }
    });

    // Создаем JWT токен
    const token = createToken(newUser);

    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      success: true,
      message: 'Регистрация выполнена успешно',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при регистрации пользователя'
    });
  }
});

/**
 * Регистрация администратора (защищенный маршрут)
 * POST /api/auth/register-admin
 */
router.post('/register-admin', async (req, res) => {
  try {
    const { email, password, name, adminKey } = req.body;

    // Проверка наличия обязательных полей
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email и пароль обязательны'
      });
    }

    // Проверка секретного ключа админа из переменных окружения
    const secretAdminKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!secretAdminKey || adminKey !== secretAdminKey) {
      return res.status(403).json({
        success: false,
        error: 'Недопустимый ключ администратора'
      });
    }

    // Проверка существующего пользователя
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Пользователь с таким email уже существует'
      });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание администратора
    const newAdmin = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'admin' // Устанавливаем роль admin
      }
    });

    // Создаем JWT токен
    const token = createToken(newAdmin);

    // Возвращаем данные без пароля
    const { password: _, ...adminWithoutPassword } = newAdmin;

    return res.status(201).json({
      success: true,
      message: 'Администратор успешно зарегистрирован',
      user: adminWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Ошибка при регистрации администратора:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при регистрации администратора'
    });
  }
});

/**
 * Авторизация пользователя
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email и пароль обязательны'
      });
    }

    // Поиск пользователя
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Неверный email или пароль'
      });
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Неверный email или пароль'
      });
    }

    // Создаем JWT токен
    const token = createToken(user);

    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      success: true,
      message: 'Авторизация успешна',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    if (error instanceof Error) {
      console.error('Stack trace:', error.stack);
    }
    return res.status(500).json({
      success: false,
      error: 'Ошибка при авторизации'
    });
  }
});

/**
 * Получение данных текущего пользователя
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при получении данных пользователя'
    });
  }
});

/**
 * Обновление данных текущего пользователя
 * PUT /api/auth/me
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;
    
    const updatedUser = await db.user.update({
      where: { id: req.user?.id },
      data: {
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });
    
    return res.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error('Ошибка при обновлении данных пользователя:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при обновлении данных пользователя'
    });
  }
});

/**
 * Смена пароля текущего пользователя
 * PUT /api/auth/change-password
 */
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Получить текущего пользователя с паролем
    const user = await db.user.findUnique({
      where: { id: req.user?.id }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Пользователь не найден'
      });
    }
    
    // Проверить текущий пароль
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Текущий пароль неверен'
      });
    }
    
    // Хеширование нового пароля
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Обновить пароль
    await db.user.update({
      where: { id: req.user?.id },
      data: { password: hashedPassword }
    });
    
    return res.json({
      success: true,
      message: 'Пароль успешно изменён'
    });
  } catch (error) {
    console.error('Ошибка при смене пароля:', error);
    return res.status(500).json({
      success: false,
      error: 'Ошибка при смене пароля'
    });
  }
});

export default router;