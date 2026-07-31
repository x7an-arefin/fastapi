import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

});

export const GetUserOutputSchema = UserBaseSchema;

export type GetUserOutput = z.infer<typeof GetUserOutputSchema>;
