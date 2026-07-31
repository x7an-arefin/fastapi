// ╔══════════════════════════════════════════════════════════════════════╗
// ║  GENERATED FILE — DO NOT EDIT MANUALLY                              ║
// ║  Entity: User | Operation: LIST — Output Schema ║
// ╚══════════════════════════════════════════════════════════════════════╝
import { z } from 'zod';

const UserBaseSchema = z.object({
  id: z.string(),
  email: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),

});


export const ListUserOutputSchema = z.object({
  items: z.array(UserBaseSchema),
  nextCursor: z.string().nullable(),
  hasMore: z.boolean(),
});


export type ListUserOutput = z.infer<typeof ListUserOutputSchema>;
