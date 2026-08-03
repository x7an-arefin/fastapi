import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),

});


export const GetUserOutputSchema = UserBaseSchema;


export type GetUserOutput = z.infer<typeof GetUserOutputSchema>;
