// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: CREATE — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const CreateTaskInputSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'completed', 'archived']).optional().default('todo'),
  priority: z.number().int().default(1),
  userId: z.string().uuid(),

});



export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
