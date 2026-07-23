import { z } from "zod";

const problemSchema = z.object({
  company: z.string().min(1, "Comapny is required."),
  problem: z
    .string()
    .min(1, "Problem is required")
    .regex(/^.{10,}$/, "Minimum 10 characters are required."),
});

export default problemSchema;
