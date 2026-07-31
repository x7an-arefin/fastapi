import { z } from 'zod';

export const GetUserInputSchema = z.object({
  id: z.string().uuid(),
});

export type GetUserInput = z.infer<typeof GetUserInputSchema>;
