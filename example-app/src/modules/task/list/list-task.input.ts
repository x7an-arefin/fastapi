// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: LIST — Input Schema  ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';


export const ListTaskInputSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
  status: z.string().optional(),
  userId: z.string().optional(),

});


export type ListTaskInput = z.infer<typeof ListTaskInputSchema>;
