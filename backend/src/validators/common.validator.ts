import { z } from "zod";

export const cuidParamSchema = z.object({
  params: z.object({
    id: z.string().cuid()
  })
});
