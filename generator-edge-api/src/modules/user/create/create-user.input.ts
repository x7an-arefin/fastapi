import { z } from 'zod';


export const CreateUserInputSchema = z.object({
  email: z.string(),
  name: z.string(),
  role: z.string().default('user'),

});



export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
