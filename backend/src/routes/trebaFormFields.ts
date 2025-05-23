import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client'; // Import Prisma
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Create TrebaFormField
router.post('/', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { fieldName, fieldType, label, options, isRequired, order, placeholder } = req.body; // Removed defaultValue, validationRegex, validationMessage
    const newField = await prisma.trebaFormField.create({
      data: {
        fieldName,
        fieldType,
        label,
        options: options === null ? Prisma.JsonNull : options ? JSON.stringify(options) : undefined,
        isRequired,
        order,
        placeholder,
      },
    });
    res.status(201).json(newField);
  } catch (error) {
    console.error('Error creating TrebaFormField:', error);
    res.status(500).json({ error: 'Failed to create TrebaFormField' });
  }
});

// Get all TrebaFormFields
router.get('/', async (req, res) => {
  try {
    const fields = await prisma.trebaFormField.findMany({
      orderBy: { order: 'asc' },
    });
    res.json(fields.map(field => ({
      ...field,
      options: field.options ? JSON.parse(field.options as string) : null,
    })));
  } catch (error) {
    console.error('Error fetching TrebaFormFields:', error);
    res.status(500).json({ error: 'Failed to fetch TrebaFormFields' });
  }
});

// Get TrebaFormField by ID
router.get('/:id', async (req, res) => {
  try {
    const field = await prisma.trebaFormField.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!field) {
      return res.status(404).json({ error: 'TrebaFormField not found' });
    }
    res.json({
        ...field,
        options: field.options ? JSON.parse(field.options as string) : null,
    });
  } catch (error) {
    console.error('Error fetching TrebaFormField:', error);
    res.status(500).json({ error: 'Failed to fetch TrebaFormField' });
  }
});

// Update TrebaFormField
router.put('/:id', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    const { fieldName, fieldType, label, options, isRequired, order, placeholder } = req.body; // Removed defaultValue, validationRegex, validationMessage
    const updatedField = await prisma.trebaFormField.update({
      where: { id: parseInt(req.params.id) },
      data: {
        fieldName,
        fieldType,
        label,
        options: options === null ? Prisma.JsonNull : options ? JSON.stringify(options) : undefined,
        isRequired,
        order,
        placeholder,
        updatedAt: new Date(),
      },
    });
    res.json(updatedField);
  } catch (error) {
    console.error('Error updating TrebaFormField:', error);
    res.status(500).json({ error: 'Failed to update TrebaFormField' });
  }
});

// Delete TrebaFormField
router.delete('/:id', authenticateToken, authorizeRoles(['ADMIN']), async (req, res) => {
  try {
    await prisma.trebaFormField.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting TrebaFormField:', error);
    res.status(500).json({ error: 'Failed to delete TrebaFormField' });
  }
});

export default router;
