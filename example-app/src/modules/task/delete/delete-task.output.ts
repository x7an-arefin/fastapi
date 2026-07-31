import { z } from 'zod';

const TaskBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  priority: z.number().int(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

});

export const DeleteTaskOutputSchema = TaskBaseSchema;

export type DeleteTaskOutput = z.infer<typeof DeleteTaskOutputSchema>;
