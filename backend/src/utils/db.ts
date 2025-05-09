import { PrismaClient } from '@prisma/client';

// Создаем экземпляр PrismaClient с логированием в режиме разработки
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// Типизация для глобальной переменной
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// Используем уже созданный экземпляр или создаем новый
export const db = globalThis.prisma ?? prismaClientSingleton();

// В режиме разработки сохраняем экземпляр в глобальной переменной для hot-reload
if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;