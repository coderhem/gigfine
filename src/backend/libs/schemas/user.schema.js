import z from "zod";

const userSchema = z.object({
  name: z.string(),
  phone: z.string(),
  vehicleNumber: z.string(),
  password: z.string().max(10),
  role: z.enum(["rider", "passenger"]).optional(),
});

export { userSchema };
