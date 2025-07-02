import { Router } from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma

const router = Router();
const prisma = new PrismaClient();

// Создать заявку на требу
router.post('/', async (req, res) => {
  try {
    const { type, names, note, period, email, dynamicFieldsData } = req.body;

    // Валидация входных данных (базовая)
    if (!type || !names || !period) {
      return res.status(400).json({ error: 'Отсутствуют обязательные поля: type, names, period' });
    }

    // Если period = 'custom', используем цену по умолчанию или не рассчитываем
    let calculatedPrice = 0;
    let currency = 'RUB';
    const namesCount = names.split('\n').filter((name: string) => name.trim() !== '').length;

    let pricingRule = null;
    if (period !== 'custom') {
      pricingRule = await prisma.trebaPricingRule.findFirst({
        where: {
          name: type,
          periodValue: period,
          isActive: true,
        },
      });
    }

    if (pricingRule) {
      if (pricingRule.priceType === 'PER_NAME') {
        calculatedPrice = namesCount * pricingRule.price;
      } else if (pricingRule.priceType === 'PER_TEN_NAMES') {
        calculatedPrice = Math.ceil(namesCount / 10) * pricingRule.price;
      } else {
        calculatedPrice = pricingRule.price;
      }
      currency = pricingRule.currency;
    } else if (period === 'custom') {
      calculatedPrice = 0;
      currency = 'RUB';
    } else {
      console.warn(`No active pricing rule found for treba ${type} and period ${period}. Price set to 0.`);
    }

    const treba = await prisma.treba.create({
      data: {
        type,
        names,
        note,
        period,
        email,
        dynamicFieldsData: dynamicFieldsData ? JSON.stringify(dynamicFieldsData) : Prisma.JsonNull,
        calculatedPrice,
        currency,
        paymentStatus: 'pending',
        // Сохраняем customDate, если есть
        customDate: req.body.customDate || null,
      }
    });
    res.status(201).json(treba);
  } catch (error) {
    console.error('Error creating Treba:', error);
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
});

// Получить все заявки (для админки)
router.get('/', async (req, res) => {
  try {
    const treby = await prisma.treba.findMany({ 
      orderBy: { createdAt: 'desc' },
    });
    res.json(treby.map(treba => ({
      ...treba,
      dynamicFieldsData: treba.dynamicFieldsData && typeof treba.dynamicFieldsData === 'string' 
                           ? JSON.parse(treba.dynamicFieldsData) 
                           : treba.dynamicFieldsData, 
    })));
  } catch (error) {
    console.error('Error fetching Treby:', error);
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Обновить статус оплаты
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const { id } = req.params;

    if (!paymentStatus) {
      return res.status(400).json({ error: 'Отсутствует обязательное поле: paymentStatus' });
    }

    const treba = await prisma.treba.update({
      where: { id: Number(id) },
      data: { paymentStatus, paymentId, updatedAt: new Date() } // Обновляем updatedAt
    });
    res.json(treba);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при обновлении статуса оплаты' });
  }
});

// Создать платёж (заглушка)
router.post('/:id/pay', async (req, res) => {
  try {
    // Здесь будет интеграция с платёжной системой
    // Например, создаём платёж и возвращаем ссылку на оплату
    const { id } = req.params;
    // В реальной интеграции: создать платёж через API платёжки
    const paymentUrl = `https://fakepay.local/pay?trebaId=${id}`;
    // Можно сохранить paymentId, если нужно
    await prisma.treba.update({ where: { id: Number(id) }, data: { paymentId: `fake_${id}` } });
    res.json({ url: paymentUrl });
  } catch (error) {
    res.status(500).json({ error: 'Ошибка создания платежа' });
  }
});

// Дополнительный маршрут для админки - обновление всей информации о требе
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, names, note, period, email, paymentStatus, paymentId, dynamicFieldsData, calculatedPrice, currency } = req.body;

    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: 'Нет данных для обновления' });
    }
    
    let finalCalculatedPrice = calculatedPrice;
    let finalCurrency = currency;

    if (names !== undefined || period !== undefined || type !== undefined) {
        const currentTreba = await prisma.treba.findUnique({ where: {id: Number(id)}});
        if (!currentTreba) {
            return res.status(404).json({ error: 'Заявка на требу не найдена для пересчета цены' });
        }

        const namesToCalculate = names !== undefined ? names : currentTreba.names;
        const periodToCalculate = period !== undefined ? period : currentTreba.period;
        const typeToCalculate = type !== undefined ? type : currentTreba.type;
        
        const namesCount = namesToCalculate.split('\n').filter((name: string) => name.trim() !== '').length;

        const pricingRule = await prisma.trebaPricingRule.findFirst({
            where: {
                name: typeToCalculate, // ИСПРАВЛЕНО: используем 'name' вместо 'trebaName'
                periodValue: periodToCalculate,
                isActive: true,
            },
        });

        if (pricingRule) {
            if (pricingRule.priceType === 'PER_NAME') {
                finalCalculatedPrice = namesCount * pricingRule.price;
            } else if (pricingRule.priceType === 'PER_TEN_NAMES') {
                finalCalculatedPrice = Math.ceil(namesCount / 10) * pricingRule.price;
            } else {
                finalCalculatedPrice = pricingRule.price;
            }
            finalCurrency = pricingRule.currency;
        } else {
            finalCalculatedPrice = calculatedPrice !== undefined ? calculatedPrice : currentTreba.calculatedPrice ?? 0;
            finalCurrency = currency !== undefined ? currency : currentTreba.currency ?? 'RUB';
            console.warn(`No active pricing rule found for treba ${typeToCalculate} and period ${periodToCalculate} during update. Price may not be updated.`);
        }
    }

    const dataToUpdate: Prisma.TrebaUpdateInput = {
        updatedAt: new Date()
    };
    if (type !== undefined) dataToUpdate.type = type;
    if (names !== undefined) dataToUpdate.names = names;
    if (note !== undefined) dataToUpdate.note = note;
    if (period !== undefined) dataToUpdate.period = period;
    if (email !== undefined) dataToUpdate.email = email;
    if (paymentStatus !== undefined) dataToUpdate.paymentStatus = paymentStatus;
    if (paymentId !== undefined) dataToUpdate.paymentId = paymentId;
    if (dynamicFieldsData !== undefined) {
        dataToUpdate.dynamicFieldsData = dynamicFieldsData === null ? Prisma.JsonNull : JSON.stringify(dynamicFieldsData);
    }
    if (finalCalculatedPrice !== undefined) dataToUpdate.calculatedPrice = finalCalculatedPrice;
    if (finalCurrency !== undefined) dataToUpdate.currency = finalCurrency;

    const treba = await prisma.treba.update({
      where: { id: Number(id) },
      data: dataToUpdate
    });
    res.json({
        ...treba,
        dynamicFieldsData: treba.dynamicFieldsData && typeof treba.dynamicFieldsData === 'string' 
                           ? JSON.parse(treba.dynamicFieldsData) 
                           : treba.dynamicFieldsData,
    });
  } catch (error: any) {
    if (error.code === 'P2025') { // Код ошибки Prisma для случая, когда запись не найдена
      return res.status(404).json({ error: 'Заявка на требу не найдена' });
    }
    res.status(500).json({ error: 'Ошибка при обновлении заявки' });
  }
});

// Дополнительный маршрут для админки - удаление требы
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.treba.delete({
      where: { id: Number(id) }
    });
    res.status(204).send(); // No content
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Заявка на требу не найдена' });
    }
    res.status(500).json({ error: 'Ошибка при удалении заявки' });
  }
});

export default router;
