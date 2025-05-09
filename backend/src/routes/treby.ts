import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Создать заявку на требу
router.post('/', async (req, res) => {
  try {
    const { type, names, note } = req.body;
    const treba = await prisma.treba.create({
      data: { type, names, note }
    });
    res.status(201).json(treba);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при создании заявки' });
  }
});

// Получить все заявки (для админки)
router.get('/', async (req, res) => {
  try {
    const treby = await prisma.treba.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(treby);
  } catch (error) {
    res.status(500).json({ error: 'Ошибка при получении заявок' });
  }
});

// Обновить статус оплаты
router.patch('/:id/payment', async (req, res) => {
  try {
    const { paymentStatus, paymentId } = req.body;
    const { id } = req.params;
    const treba = await prisma.treba.update({
      where: { id: Number(id) },
      data: { paymentStatus, paymentId }
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

export default router;
