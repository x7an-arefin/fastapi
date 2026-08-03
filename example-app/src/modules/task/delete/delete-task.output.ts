import { z } from 'zod';

const TaskBaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  priority: z.string(),
  userId: z.string(),

});


export const DeleteTaskOutputSchema = TaskBaseSchema;


export type DeleteTaskOutput = z.infer<typeof DeleteTaskOutputSchema>;
