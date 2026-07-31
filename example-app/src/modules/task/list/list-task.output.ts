// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: LIST — Output Schema ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';

const TaskBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.number().int(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

});


export const ListTaskOutputSchema = z.object({
  items: z.array(TaskBaseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});


export type ListTaskOutput = z.infer<typeof ListTaskOutputSchema>;
