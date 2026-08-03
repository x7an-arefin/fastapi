import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  role: z.string(),

});


export const ListUserOutputSchema = z.object({
  items: z.array(UserBaseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});


export type ListUserOutput = z.infer<typeof ListUserOutputSchema>;
