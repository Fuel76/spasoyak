import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Получить все типы треб
router.get('/', async (req: Request, res: Response) => {
  try {
    const trebaTypes = await prisma.trebaType.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      data: trebaTypes,
      total: trebaTypes.length
    });
  } catch (error) {
    console.error('Ошибка при получении типов треб:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при получении типов треб' 
    });
  }
});

// Получить активные типы треб (для публичного API)
router.get('/active', async (req: Request, res: Response) => {
  try {
    const trebaTypes = await prisma.trebaType.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      data: trebaTypes,
      total: trebaTypes.length
    });
  } catch (error) {
    console.error('Ошибка при получении активных типов треб:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при получении активных типов треб' 
    });
  }
});

// Получить конкретный тип требы
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const trebaType = await prisma.trebaType.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!trebaType) {
      return res.status(404).json({ 
        error: 'Тип требы не найден' 
      });
    }

    res.json(trebaType);
  } catch (error) {
    console.error('Ошибка при получении типа требы:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при получении типа требы' 
    });
  }
});

// Создать новый тип требы
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      name, 
      description, 
      basePrice, 
      currency, 
      period, 
      isActive 
    } = req.body;

    // Валидация обязательных полей
    if (!name || basePrice === undefined) {
      return res.status(400).json({ 
        error: 'Название и базовая стоимость обязательны' 
      });
    }

    // Проверка на уникальность названия
    const existingType = await prisma.trebaType.findFirst({
      where: {
        name: name.trim()
      }
    });

    if (existingType) {
      return res.status(400).json({ 
        error: 'Тип требы с таким названием уже существует' 
      });
    }

    const trebaType = await prisma.trebaType.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        basePrice: parseFloat(basePrice),
        currency: currency || 'RUB',
        period: period || 'Разовое',
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.status(201).json(trebaType);
  } catch (error) {
    console.error('Ошибка при создании типа требы:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при создании типа требы' 
    });
  }
});

// Обновить тип требы
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      name, 
      description, 
      basePrice, 
      currency, 
      period, 
      isActive 
    } = req.body;

    // Валидация обязательных полей
    if (!name || basePrice === undefined) {
      return res.status(400).json({ 
        error: 'Название и базовая стоимость обязательны' 
      });
    }

    // Проверка существования типа требы
    const existingType = await prisma.trebaType.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingType) {
      return res.status(404).json({ 
        error: 'Тип требы не найден' 
      });
    }

    // Проверка на уникальность названия (исключая текущий тип)
    const duplicateType = await prisma.trebaType.findFirst({
      where: {
        name: name.trim(),
        id: {
          not: parseInt(id)
        }
      }
    });

    if (duplicateType) {
      return res.status(400).json({ 
        error: 'Тип требы с таким названием уже существует' 
      });
    }

    const updatedTrebaType = await prisma.trebaType.update({
      where: {
        id: parseInt(id)
      },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        basePrice: parseFloat(basePrice),
        currency: currency || 'RUB',
        period: period || 'Разовое',
        isActive: isActive !== undefined ? isActive : true
      }
    });

    res.json(updatedTrebaType);
  } catch (error) {
    console.error('Ошибка при обновлении типа требы:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при обновлении типа требы' 
    });
  }
});

// Переключить активность типа требы
router.patch('/:id/toggle-active', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Проверка существования типа требы
    const existingType = await prisma.trebaType.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!existingType) {
      return res.status(404).json({ 
        error: 'Тип требы не найден' 
      });
    }

    // Переключить активность
    const updatedType = await prisma.trebaType.update({
      where: {
        id: parseInt(id)
      },
      data: {
        isActive: !existingType.isActive
      }
    });

    res.json(updatedType);
  } catch (error) {
    console.error('Ошибка при переключении активности типа требы:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при переключении активности типа требы' 
    });
  }
});

// Удалить тип требы
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log('DELETE request for treba type ID:', id, 'typeof:', typeof id);

    // Проверка, что ID является числом
    const numericId = parseInt(id);
    if (isNaN(numericId)) {
      console.log('Invalid ID provided:', id);
      return res.status(400).json({ 
        error: 'Некорректный ID типа требы' 
      });
    }

    // Проверка существования типа требы
    const existingType = await prisma.trebaType.findUnique({
      where: {
        id: numericId
      }
    });

    if (!existingType) {
      console.log('Treba type not found for ID:', numericId);
      return res.status(404).json({ 
        error: 'Тип требы не найден' 
      });
    }

    console.log('Found treba type:', existingType.name);

    // Проверка, есть ли связанные требы
    const relatedTreby = await prisma.treba.findFirst({
      where: {
        type: existingType.name
      }
    });

    if (relatedTreby) {
      console.log('Found related treby for type:', existingType.name);
      return res.status(400).json({ 
        error: 'Невозможно удалить тип требы, так как есть связанные требы. Деактивируйте тип вместо удаления.' 
      });
    }

    console.log('Deleting treba type:', existingType.name);
    await prisma.trebaType.delete({
      where: {
        id: numericId
      }
    });

    console.log('Successfully deleted treba type ID:', numericId);
    res.json({ 
      message: 'Тип требы успешно удален' 
    });
  } catch (error) {
    console.error('Ошибка при удалении типа требы:', error);
    res.status(500).json({ 
      error: 'Внутренняя ошибка сервера при удалении типа требы' 
    });
  }
});

export default router;
