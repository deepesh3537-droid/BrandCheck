import { z } from 'zod';

export const sourceTypes = ['guideline', 'term', 'fact', 'claim', 'tone'];

export const createSourceSchema = z.object({
  type: z.enum(sourceTypes, {
    errorMap: () => ({ message: `Type must be one of: ${sourceTypes.join(', ')}` }),
  }),
  title: z
    .string({ required_error: 'Title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  body: z
    .string({ required_error: 'Body content is required' })
    .trim()
    .min(1, 'Body content cannot be empty'),
  structured: z.record(z.any()).optional().default({}),
});

export const updateSourceSchema = z.object({
  type: z.enum(sourceTypes).optional(),
  title: z.string().trim().min(2).max(255).optional(),
  body: z.string().trim().min(1).optional(),
  structured: z.record(z.any()).optional(),
  active: z.boolean().optional(),
});
