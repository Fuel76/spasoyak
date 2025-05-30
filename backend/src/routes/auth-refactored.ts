import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

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

    const result = await AuthService.registerUser({ email, password, name });

    return res.status(201).json({
      success: true,
      message: 'Регистрация выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Ошибка при регистрации:', error);
    
    if (error.message === 'Пользователь с таким email уже существует') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }
    
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

    if (!adminKey) {
      return res.status(400).json({
        success: false,
        error: 'Ключ администратора обязателен'
      });
    }

    const result = await AuthService.registerAdmin({ email, password, name, adminKey });

    return res.status(201).json({
      success: true,
      message: 'Регистрация администратора выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Ошибка при регистрации администратора:', error);

    if (error.message === 'Неверный ключ администратора') {
      return res.status(403).json({
        success: false,
        error: error.message
      });
    }

    if (error.message === 'Пользователь с таким email уже существует') {
      return res.status(409).json({
        success: false,
        error: error.message
      });
    }

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

    const result = await AuthService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Авторизация выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    console.error('Ошибка при авторизации:', error);
    
    if (error.message === 'Пользователь не найден' || error.message === 'Неверный пароль') {
      return res.status(401).json({
        success: false,
        error: 'Неверные учетные данные'
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Ошибка при авторизации пользователя'
    });
  }
});

/**
 * Проверка аутентификации и получение данных текущего пользователя
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    
    // Получаем данные пользователя из базы данных
    const user = await AuthService.getUserById(userId);
    
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

export default router;
