import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
    isAdmin: boolean;
  };
}

// Middleware для проверки JWT токена
const authenticateToken = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Middleware для проверки прав администратора
const requireAdmin = (req: AuthRequest, res: Response, next: any) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Требуются права администратора' });
  }
  next();
};

// Получить всех пользователей
router.get('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      users: users,
      total: users.length
    });
  } catch (error) {
    console.error('Ошибка получения пользователей:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения пользователей' 
    });
  }
});

// Получить пользователя по ID
router.get('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден' 
      });
    }

    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('Ошибка получения пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка получения пользователя' 
    });
  }
});

// Создать нового пользователя
router.post('/', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Проверяем обязательные поля
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email и пароль обязательны' 
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'Пользователь с таким email уже существует' 
      });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: ['admin', 'moderator', 'user'].includes(role) ? role : 'user'
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.status(201).json({
      success: true,
      user: newUser,
      message: 'Пользователь успешно создан'
    });
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка создания пользователя' 
    });
  }
});

// Обновить пользователя
router.put('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, name, role, password } = req.body;

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден' 
      });
    }

    // Подготавливаем данные для обновления
    const updateData: any = {};
    
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role && ['admin', 'moderator', 'user'].includes(role)) {
      updateData.role = role;
    }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Обновляем пользователя
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      success: true,
      user: updatedUser,
      message: 'Пользователь успешно обновлен'
    });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка обновления пользователя' 
    });
  }
});

// Удалить пользователя
router.delete('/:id', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден' 
      });
    }

    // Удаляем пользователя
    await prisma.user.delete({
      where: { id: userId }
    });

    res.json({
      success: true,
      message: 'Пользователь успешно удален'
    });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка удаления пользователя' 
    });
  }
});

// Изменить роль пользователя
router.patch('/:id/role', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    if (!role || !['admin', 'moderator', 'user'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Недопустимая роль. Разрешены: admin, moderator, user' 
      });
    }

    // Проверяем, существует ли пользователь
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return res.status(404).json({ 
        success: false, 
        error: 'Пользователь не найден' 
      });
    }

    // Обновляем роль
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({
      success: true,
      user: updatedUser,
      message: `Роль пользователя изменена на ${role}`
    });
  } catch (error) {
    console.error('Ошибка изменения роли:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Ошибка изменения роли пользователя' 
    });
  }
});

export default router;
