import { z } from 'zod';


export const CreateTaskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  status: z.string().default('pending'),
  priority: z.string().default('medium'),
  userId: z.string().uuid(),

});



export type CreateTaskInput = z.infer<typeof CreateTaskInputSchema>;
