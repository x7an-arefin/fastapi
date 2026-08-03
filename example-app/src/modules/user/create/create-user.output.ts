import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),

});


export const CreateUserOutputSchema = UserBaseSchema;


export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;
