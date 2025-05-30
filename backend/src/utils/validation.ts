import { z } from 'zod';

// Схема для регистрации обычного пользователя
export const registerSchema = z.object({
  email: z.string().email('Email должен быть корректным адресом электронной почты'),
  password: z
    .string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/[a-z]/, 'Пароль должен содержать хотя бы одну строчную букву')
    .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
    .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
  name: z.string().optional(),
});

// Схема для регистрации администратора
export const registerAdminSchema = registerSchema.extend({
  adminKey: z.string().min(1, 'Ключ администратора обязателен'),
});

// Схема для входа в систему
export const loginSchema = z.object({
  email: z.string().email('Email должен быть корректным адресом электронной почты'),
  password: z.string().min(1, 'Пароль обязателен'),
});

// Схема для создания новости
export const newsSchema = z.object({
  title: z.string().min(3, 'Заголовок должен содержать минимум 3 символа'),
  content: z.string().min(10, 'Содержание должно содержать минимум 10 символов'),
  htmlContent: z.string().optional(),
  media: z.array(z.string()).default([]),
  cover: z.string().optional(),
  isVisible: z.boolean().default(true),
  customCss: z.string().optional(),
});

// Схема для создания страницы
export const pageSchema = z.object({
  slug: z.string().min(1, 'URL обязателен').regex(/^[a-z0-9-]+$/, 'URL может содержать только буквы, цифры и дефисы'),
  title: z.string().min(3, 'Заголовок должен содержать минимум 3 символа'),
  content: z.string().min(10, 'Содержание должно содержать минимум 10 символов'),
  isVisible: z.boolean().default(true),
  customCss: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

// Схема для требы
export const trebaSchema = z.object({
  type: z.string().min(1, 'Тип требы обязателен'),
  names: z.string().min(1, 'Необходимо указать имена'),
  period: z.string().default('Разовое'),
  email: z.string().email('Email должен быть корректным адресом электронной почты').optional(),
  note: z.string().optional(),
  dynamicFieldsData: z.record(z.unknown()).optional(),
  calculatedPrice: z.number().optional(),
  currency: z.string().optional(),
  customDate: z.string().datetime().optional().nullable(),
});

// Схема для поля формы требы
export const trebaFormFieldSchema = z.object({
  fieldName: z.string().min(1, 'Имя поля обязательно'),
  fieldType: z.enum(['TEXT', 'TEXTAREA', 'SELECT', 'RADIO', 'CHECKBOX', 'NUMBER']),
  label: z.string().min(1, 'Метка поля обязательна'),
  options: z.array(
    z.object({
      value: z.string(),
      label: z.string()
    })
  ).optional(),
  placeholder: z.string().optional(),
  isRequired: z.boolean().default(false),
  order: z.number().default(0),
  isActive: z.boolean().default(true),
});

// Схема для правила ценообразования требы
export const trebaPricingRuleSchema = z.object({
  name: z.string().min(1, 'Название требы обязательно'),
  periodValue: z.string().min(1, 'Период требы обязателен'),
  description: z.string().optional(),
  price: z.number().min(0, 'Цена не может быть отрицательной'),
  priceType: z.enum(['PER_NAME', 'PER_TEN_NAMES', 'FIXED']),
  currency: z.string().default('RUB'),
  isActive: z.boolean().default(true),
});

// Схема для пункта меню
export const menuItemSchema = z.object({
  title: z.string().min(1, 'Название пункта меню обязательно'),
  link: z.string().min(1, 'Ссылка обязательна'),
  mute: z.boolean().default(false),
  parentId: z.number().nullable().optional(),
});

// Схема для изображения карусели
export const carouselImageSchema = z.object({
  url: z.string().min(1, 'URL изображения обязателен'),
  title: z.string().optional(),
  alt: z.string().optional(),
  order: z.number().default(0),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type NewsInput = z.infer<typeof newsSchema>;
export type PageInput = z.infer<typeof pageSchema>;
export type TrebaInput = z.infer<typeof trebaSchema>;
export type TrebaFormFieldInput = z.infer<typeof trebaFormFieldSchema>;
export type TrebaPricingRuleInput = z.infer<typeof trebaPricingRuleSchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type CarouselImageInput = z.infer<typeof carouselImageSchema>;
