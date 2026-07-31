import { z } from 'zod';

export const DeleteTaskInputSchema = z.object({
  id: z.string().uuid(),
});

export type DeleteTaskInput = z.infer<typeof DeleteTaskInputSchema>;
