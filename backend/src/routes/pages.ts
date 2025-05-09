import express from 'express';
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, isAdmin } from '../middleware/auth';
import slugify from 'slugify';

const prisma = new PrismaClient();
const router = Router();

/**
 * Получение списка всех страниц
 * GET /api/pages
 */
router.get('/', async (req, res) => {
  try {
    const pages = await prisma.page.findMany({
      orderBy: {
        updatedAt: 'desc'  // Исправлено: используем объект вместо массива
      },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true, // добавлено!
        isVisible: true,
        updatedAt: true,
        createdAt: true
      }
    });
    
    res.json(pages); // Возвращаем массив напрямую
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Ошибка при получении списка страниц' });
  }
});

/**
 * Получение страницы по ID
 * GET /api/pages/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: 'Некорректный ID страницы' });
    }
    const page = await prisma.page.findUnique({
      where: { id: Number(id) }
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({ error: 'Ошибка при получении страницы' });
  }
});

/**
 * Получение страницы по slug
 * GET /api/pages/by-slug/:slug
 */
router.get('/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const page = await prisma.page.findUnique({
      where: { slug }
    });
    
    if (!page) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }
    
    // Проверяем видимость страницы для неавторизованных пользователей
    if (!page.isVisible && !req.user?.isAdmin) {
      return res.status(403).json({ error: 'Доступ запрещен' });
    }
    
    res.json(page);
  } catch (error) {
    console.error('Error fetching page by slug:', error);
    res.status(500).json({ error: 'Ошибка при получении страницы' });
  }
});

/**
 * Создание новой страницы
 * POST /api/pages
 * Требуется авторизация админа
 */
router.post('/', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { title, content, customCss, metaDescription, metaKeywords, history, isVisible = true } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Заголовок страницы обязателен' });
    }
    
    // --- Исправление: использовать slug из запроса, если он есть ---
    let slug = req.body.slug || slugify(title, {
      lower: true,     // Преобразуем в нижний регистр
      strict: true,    // Заменяем спец. символы
      locale: 'ru'     // Поддержка русских символов
    });
    
    // Проверяем уникальность slug
    const existingPage = await prisma.page.findUnique({
      where: { slug }
    });
    
    // Если slug уже существует, добавляем случайное число
    if (existingPage) {
      slug = `${slug}-${Date.now().toString().slice(-5)}`;
    }
    
    const newPage = await prisma.page.create({
      data: {
        title,
        slug,
        content,
        customCss,
        metaDescription,
        metaKeywords,
        history: history || [],
        isVisible
      }
    });
    
    res.status(201).json(newPage);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Ошибка при создании страницы' });
  }
});

/**
 * Обновление страницы
 * PUT /api/pages/:id
 * Требуется авторизация админа
 */
router.put('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, customCss, metaDescription, metaKeywords, history, isVisible } = req.body;
    
    // Проверяем существование страницы
    const existingPage = await prisma.page.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingPage) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }
    
    // Если заголовок изменился, обновляем slug
    let slug = existingPage.slug;
    if (title && title !== existingPage.title) {
      slug = slugify(title, {
        lower: true,
        strict: true,
        locale: 'ru'
      });
      
      // Проверяем уникальность нового slug (исключая текущую страницу)
      const pageWithSameSlug = await prisma.page.findFirst({
        where: {
          slug,
          id: { not: Number(id) }
        }
      });
      
      // Если slug уже существует, добавляем случайное число
      if (pageWithSameSlug) {
        slug = `${slug}-${Date.now().toString().slice(-5)}`;
      }
    }
    
    const updatedPage = await prisma.page.update({
      where: { id: Number(id) },
      data: {
        title: title || existingPage.title,
        slug,
        content: content !== undefined ? content : existingPage.content,
        customCss: customCss !== undefined ? customCss : existingPage.customCss,
        metaDescription: metaDescription !== undefined ? metaDescription : existingPage.metaDescription,
        metaKeywords: metaKeywords !== undefined ? metaKeywords : existingPage.metaKeywords,
        history: history !== undefined ? history : existingPage.history,
        isVisible: isVisible !== undefined ? isVisible : existingPage.isVisible,
        updatedAt: new Date()
      }
    });
    
    res.json(updatedPage);
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Ошибка при обновлении страницы' });
  }
});

/**
 * Удаление страницы
 * DELETE /api/pages/:id
 * Требуется авторизация админа
 */
router.delete('/:id', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Проверяем существование страницы
    const existingPage = await prisma.page.findUnique({
      where: { id: Number(id) }
    });
    
    if (!existingPage) {
      return res.status(404).json({ error: 'Страница не найдена' });
    }
    
    await prisma.page.delete({
      where: { id: Number(id) }
    });
    
    res.json({ message: 'Страница успешно удалена' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Ошибка при удалении страницы' });
  }
});

export default router;