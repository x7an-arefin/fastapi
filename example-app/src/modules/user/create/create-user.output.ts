import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

});

export const CreateUserOutputSchema = UserBaseSchema;

export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;
