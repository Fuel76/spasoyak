import express from 'express';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const CALENDAR_PATH = path.join(__dirname, '../../orthodox-calendar.json');

// Роут для получения данных из локального файла orthodox-calendar.json
router.get('/:date', (req, res) => {
  const { date } = req.params; // YYYY-MM-DD
  try {
    if (!fs.existsSync(CALENDAR_PATH)) return res.status(500).json({ error: 'Файл календаря не найден' });
    const data = JSON.parse(fs.readFileSync(CALENDAR_PATH, 'utf-8'));
    const entry = data.find((item: any) => item.date === date);
    if (!entry) return res.status(404).json({ error: 'Нет данных на эту дату' });
    res.json(entry);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка чтения календаря' });
  }
});

export default router;
