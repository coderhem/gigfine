import { z } from "zod";

// The description is optional when a voice note is attached.
// That cross-check needs the voice file, so the form does it on submit.
const problemSchema = z.object({
  service: z.string().min(1, "Service is required."),
  company: z.string().min(1, "Comapny is required."),
  problem: z
    .string()
    .trim()
    .refine((v) => v === "" || v.length >= 10, "Minimum 10 characters are required"),
  // Passenger mode only
  riderName: z.string().trim().optional(),
  vehicleNumber: z.string().trim().optional(),
});

export default problemSchema;
