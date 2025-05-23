import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Прокси для days.pravoslavie.ru
router.get('/:date', async (req, res) => {
  const { date } = req.params; // YYYY-MM-DD
  try {
    const resp = await fetch(`https://days.pravoslavie.ru/api/day/${date}.json`);
    if (!resp.ok) return res.status(502).json({ error: 'Ошибка получения данных с days.pravosлавие.ru' });
    const data = await resp.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: 'Ошибка проксирования календаря' });
  }
});

export default router;
