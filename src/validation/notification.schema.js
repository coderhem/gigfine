import { z } from "zod";

const notificationSchema = z.object({
  notification: z
    .string()
    .min(1, "Notifications is required")
    // .regex(/^[\s\S]{10,}$/, "Minimum 10 characters are required"),
});

export default notificationSchema;
