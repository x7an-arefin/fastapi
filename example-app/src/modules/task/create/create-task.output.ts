// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: Task | Operation: CREATE — Output Schema ║
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


export const CreateTaskOutputSchema = TaskBaseSchema;


export type CreateTaskOutput = z.infer<typeof CreateTaskOutputSchema>;
