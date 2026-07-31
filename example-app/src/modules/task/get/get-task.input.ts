import { z } from 'zod';

export const GetTaskInputSchema = z.object({
  id: z.string().uuid(),
});

export type GetTaskInput = z.infer<typeof GetTaskInputSchema>;
