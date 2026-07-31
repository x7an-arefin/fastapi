// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: GET — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const GetTaskInputSchema = z.object({
  id: z.string().uuid(),
});



export type GetTaskInput = z.infer<typeof GetTaskInputSchema>;
