import { z } from 'zod';


export const CreateTaskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.string().default('pending'),
  priority: z.string().default('medium'),
  userId: z.string().uuid(),
  deletedAt: z.string().datetime().optional(),

});



export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
