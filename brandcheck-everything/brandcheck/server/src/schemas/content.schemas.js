import { z } from 'zod';

export const createContentSchema = z.object({
  title: z
    .string({ required_error: 'Content title is required' })
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  body: z
    .string({ required_error: 'Content body is required' })
    .trim()
    .min(5, 'Content must contain at least 5 characters')
    .max(500000, 'Content exceeds maximum permitted length (500k characters)'),
});

export const createContentVersionSchema = z.object({
  body: z
    .string({ required_error: 'Version body is required' })
    .trim()
    .min(5, 'Content must contain at least 5 characters')
    .max(500000, 'Content exceeds maximum permitted length'),
});
