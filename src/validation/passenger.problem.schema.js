import { z } from "zod";

const passengerProblemSchema = z.object({
  company: z.string().min(1, "Comapny is required."),
  driverName: z.string(),
  vehicleNumber: z.string(),
  problem: z
    .string()
    .min(1, "Problem is required")
    .regex(/^[\s\S]{10,}$/, "Minimum 10 characters are required"),
});

export default passengerProblemSchema;
