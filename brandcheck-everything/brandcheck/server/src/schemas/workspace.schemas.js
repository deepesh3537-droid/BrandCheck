import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z
    .string({ required_error: 'Workspace name is required' })
    .trim()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name cannot exceed 100 characters'),
});

export const workspaceIdParamSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID format'),
});
