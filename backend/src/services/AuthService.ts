import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../utils/db';

type UserRegistrationData = {
  email: string;
  password: string;
  name?: string;
};

type UserWithoutPassword = {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export class AuthService {
  /**
   * Создание JWT токена
   */
  static createToken(user: any): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET отсутствует');
    }
    
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      secret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '30d' }
    );
  }

  /**
   * Регистрация обычного пользователя
   */
  static async registerUser(userData: UserRegistrationData): Promise<{
    user: UserWithoutPassword;
    token: string;
  }> {
    const { email, password, name } = userData;

    // Проверка существующего пользователя
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'user'
      }
    });

    // Создаем JWT токен
    const token = this.createToken(newUser);

    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Регистрация администратора
   */
  static async registerAdmin(userData: UserRegistrationData & { adminKey: string }): Promise<{
    user: UserWithoutPassword;
    token: string;
  }> {
    const { email, password, name, adminKey } = userData;

    // Проверка ключа администратора
    const requiredAdminKey = process.env.ADMIN_REGISTRATION_KEY;
    if (!requiredAdminKey || adminKey !== requiredAdminKey) {
      throw new Error('Неверный ключ администратора');
    }

    // Проверка существующего пользователя
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя-администратора
    const newUser = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        role: 'admin'
      }
    });

    // Создаем JWT токен
    const token = this.createToken(newUser);

    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = newUser;

    return {
      user: userWithoutPassword,
      token
    };
  }

  /**
   * Аутентификация пользователя
   */
  static async loginUser(email: string, password: string): Promise<{
    user: UserWithoutPassword;
    token: string;
  }> {
    // Поиск пользователя
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Пользователь не найден');
    }

    // Проверка пароля
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Неверный пароль');
    }

    // Создаем JWT токен
    const token = this.createToken(user);

    // Возвращаем данные без пароля
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token
    };
  }
}
