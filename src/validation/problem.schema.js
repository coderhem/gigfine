import { z } from "zod";

const problemSchema = z.object({
  service: z.string().min(1, "Service is required."),
  company: z.string().min(1, "Comapny is required."),
  problem: z
    .string()
    .min(1, "Problem is required")
    .regex(/^[\s\S]{10,}$/, "Minimum 10 characters are required"),
});

export default problemSchema;
