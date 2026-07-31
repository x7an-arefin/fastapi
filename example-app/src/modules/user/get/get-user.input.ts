// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: User | Operation: GET — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const GetUserInputSchema = z.object({
  id: z.string().uuid(),
});



export type GetUserInput = z.infer<typeof GetUserInputSchema>;
