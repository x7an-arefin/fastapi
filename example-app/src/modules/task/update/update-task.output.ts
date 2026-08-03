import { z } from 'zod';

const TaskBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  userId: z.string(),

});


export const UpdateTaskOutputSchema = TaskBaseSchema;


export type UpdateTaskOutput = z.infer<typeof UpdateTaskOutputSchema>;
