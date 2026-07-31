// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: UPDATE — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const UpdateTaskInputSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'archived']).optional(),
  priority: z.number().int().optional(),
  userId: z.string().uuid().optional(),

}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});



export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
