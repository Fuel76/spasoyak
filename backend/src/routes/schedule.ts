import express from 'express';
import fs from 'fs';
import path from 'path';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();
const SCHEDULE_PATH = path.join(__dirname, '../../schedule.json');

// Получить расписание
router.get('/', (req, res) => {
  try {
    if (fs.existsSync(SCHEDULE_PATH)) {
      const data = fs.readFileSync(SCHEDULE_PATH, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (e) {
    res.status(500).json({ error: 'Ошибка чтения расписания' });
  }
});

// Сохранить расписание (только для администратора)
router.post('/', authenticateToken, authorizeRoles(['admin']), (req, res) => {
  try {
    const { schedule } = req.body;
    if (!Array.isArray(schedule)) return res.status(400).json({ error: 'Некорректный формат' });
    fs.writeFileSync(SCHEDULE_PATH, JSON.stringify(schedule, null, 2), 'utf-8');
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: 'Ошибка сохранения расписания' });
  }
});

export default router;
