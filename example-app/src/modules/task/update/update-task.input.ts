import { z } from 'zod';


export const UpdateTaskInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  userId: z.string().uuid().optional(),

}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});



export type UpdateTaskInput = z.infer<typeof UpdateTaskInputSchema>;
