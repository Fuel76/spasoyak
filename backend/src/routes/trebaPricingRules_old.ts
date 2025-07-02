import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Create TrebaPricingRule (требует авторизации администратора)
router.post('/', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { name, periodValue, description, price, priceType, currency, isActive } = req.body;
    const newRule = await prisma.trebaPricingRule.create({
      data: {
        name,
        periodValue,
        description,
        price,
        priceType,
        currency: currency || 'RUB',
        isActive,
      },
    });
    res.status(201).json(newRule);
  } catch (error) {
    console.error('Error creating TrebaPricingRule:', error);
    res.status(500).json({ error: 'Failed to create TrebaPricingRule' });
  }
});

// Get all TrebaPricingRules (доступно без авторизации)
router.get('/', async (req, res) => {
  try {
    const { name, periodValue, isActive } = req.query;
    const where: any = {};
    if (name) where.name = name as string;
    if (periodValue) where.periodValue = periodValue as string;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    const rules = await prisma.trebaPricingRule.findMany({ where });
    res.json(rules);
  } catch (error) {
    console.error('Error fetching TrebaPricingRules:', error);
    res.status(500).json({ error: 'Failed to fetch TrebaPricingRules' });
  }
});

// Get TrebaPricingRule by ID (доступно без авторизации)
router.get('/:id', async (req, res) => {
  try {
    const rule = await prisma.trebaPricingRule.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!rule) {
      return res.status(404).json({ error: 'TrebaPricingRule not found' });
    }
    res.json(rule);
  } catch (error) {
    console.error('Error fetching TrebaPricingRule:', error);
    res.status(500).json({ error: 'Failed to fetch TrebaPricingRule' });
  }
});

// Update TrebaPricingRule (требует авторизации администратора)
router.put('/:id', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { name, periodValue, description, price, priceType, currency, isActive } = req.body;
    const updatedRule = await prisma.trebaPricingRule.update({
      where: { id: parseInt(req.params.id) },
      data: {
        name,
        periodValue,
        description,
        price,
        priceType,
        currency: currency || 'RUB',
        isActive,
        updatedAt: new Date(),
      },
    });
    res.json(updatedRule);
  } catch (error) {
    console.error('Error updating TrebaPricingRule:', error);
    res.status(500).json({ error: 'Failed to update TrebaPricingRule' });
  }
});

// Delete TrebaPricingRule (требует авторизации администратора)
router.delete('/:id', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.trebaPricingRule.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TrebaPricingRule:', error);
    res.status(500).json({ error: 'Failed to delete TrebaPricingRule' });
  }
});

export default router;
