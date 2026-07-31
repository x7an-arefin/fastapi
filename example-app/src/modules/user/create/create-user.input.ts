// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: User | Operation: CREATE — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const CreateUserInputSchema = z.object({
  email: z.string().max(255),
  name: z.string().max(100),
  role: z.enum(['user', 'admin']).optional().default('user'),

});



export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;
