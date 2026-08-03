import { z } from 'zod';

const TaskBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  userId: z.string(),

});


export const CreateTaskOutputSchema = TaskBaseSchema;


export type CreateTaskOutput = z.infer<typeof CreateTaskOutputSchema>;
