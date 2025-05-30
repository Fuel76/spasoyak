import { Router } from 'express';
import { AuthService } from '../services/AuthService';
import { authenticateToken } from '../middleware/auth';
import { validate } from '../middleware/validationMiddleware';
import { registerSchema, registerAdminSchema, loginSchema } from '../utils/validation';
import { BadRequestError, NotFoundError, UnauthorizedError, ConflictError } from '../middleware/errorHandler';

const router = Router();

/**
 * Регистрация пользователя
 * POST /api/auth/register
 */
router.post('/register', validate(registerSchema), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    const result = await AuthService.registerUser({ email, password, name });

    return res.status(201).json({
      success: true,
      message: 'Регистрация выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    if (error.message === 'Пользователь с таким email уже существует') {
      return next(ConflictError(error.message));
    }
    
    next(error);
  }
});

/**
 * Регистрация администратора (защищенный маршрут)
 * POST /api/auth/register-admin
 */
router.post('/register-admin', validate(registerAdminSchema), async (req, res, next) => {
  try {
    const { email, password, name, adminKey } = req.body;

    const result = await AuthService.registerAdmin({ email, password, name, adminKey });

    return res.status(201).json({
      success: true,
      message: 'Регистрация администратора выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    if (error.message === 'Неверный ключ администратора') {
      return next(UnauthorizedError(error.message));
    }

    if (error.message === 'Пользователь с таким email уже существует') {
      return next(ConflictError(error.message));
    }

    next(error);
  }
});

/**
 * Авторизация пользователя
 * POST /api/auth/login
 */
router.post('/login', validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await AuthService.loginUser(email, password);

    return res.status(200).json({
      success: true,
      message: 'Авторизация выполнена успешно',
      user: result.user,
      token: result.token
    });
  } catch (error: any) {
    if (error.message === 'Пользователь не найден' || error.message === 'Неверный пароль') {
      return next(UnauthorizedError('Неверные учетные данные'));
    }
    
    next(error);
  }
});

/**
 * Проверка аутентификации и получение данных текущего пользователя
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.userId;
    
    // Получаем данные пользователя из базы данных
    const user = await AuthService.getUserById(userId);
    
    if (!user) {
      return next(NotFoundError('Пользователь не найден'));
    }
    
    return res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

export default router;
