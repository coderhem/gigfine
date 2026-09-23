import { z } from "zod";

// const vehicleRegex =
//   /^([a-z]{2}-[a-z]{2}-[a-z]{3}-\d{3}-\d{3}-\d{4}|[a-z]{2}-\d{1,2}-[a-z]{1,3}-\d{1,4})$/i;

export const registerValidation = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full Name is required.")
      .min(3, "Minimum 3 characters required.")
      .regex(/^[A-Za-z]+(?:\s[A-Za-z]+)+$/, "Enter a valid name"),

    phone: z
      .string()
      .trim()
      .min(1, "Phone number is required.")
      .length(10, "Phone number must be exactly 10 digits.")
      .regex(/^\d+$/, "Phone number must contain only digits"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .regex(
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address.",
      ),
    role: z.enum(["rider", "passenger"]),

    vehicleNumber: z.string().trim().min(1, "Vehicle number is required"),

    licenseNumber: z.string().trim().min(1, "License number is required"),

    password: z
      .string()
      .trim()
      .min(1, "Password is required.")
      .min(8, "Password must be at least 8 characters.")
      // .regex(
      //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]+$/,
      //   "Use uppercase, lowercase, number & symbol.",
      // ),
  })
  // .superRefine((data, ctx) => {
  //   if (data.role === "rider") {
  //     if (!data.vehicleNumber || data.vehicleNumber.trim() === "") {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         path: ["vehicleNumber"],
  //         message: "Vehicle number is required",
  //       });
  //       return;
  //     }

  //     if (!vehicleRegex.test(data.vehicleNumber)) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         path: ["vehicleNumber"],
  //         message: "Enter a valid vehicle number",
  //       });
  //     }
  //   }
  // });

export const loginValidation = z.object({
  // Backend accepts either mobile number or email as the username
  phone: z
    .string()
    .trim()
    .min(1, "Phone number or email is required.")
    .refine(
      (v) => /^\d{10}$/.test(v) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      "Enter a 10 digit phone number or a valid email.",
    ),

  password: z.string().trim().min(1, "Password is required."),
});
export const forgotPasswordValidation = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address."),
});

export const resetPasswordValidation = z.object({
  password: z
    .string()
    .trim()
    .min(1, "Password is required.")
    .min(8, "Password must be at least 8 characters.")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=])[A-Za-z\d@$!%*?&#^()_\-+=]+$/,
      "Use uppercase, lowercase, number & symbol.",
    ),
});
