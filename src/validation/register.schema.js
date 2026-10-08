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

    // Required only for riders (checked in superRefine below)
    vehicleNumber: z.string().trim().optional(),

    licenseNumber: z.string().trim().optional(),

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
  .superRefine((data, ctx) => {
    if (data.role !== "rider") return;
    if (!data.vehicleNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["vehicleNumber"],
        message: "Vehicle number is required",
      });
    }
    if (!data.licenseNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["licenseNumber"],
        message: "License number is required",
      });
    }
  });
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

const required = (label) => z.string().trim().min(1, `${label} is required.`);

const phoneField = (label) =>
  required(label)
    .length(10, `${label} must be exactly 10 digits.`)
    .regex(/^\d+$/, `${label} must contain only digits`);

// business.gigfine.com sign-up: the account fields + the business details
export const businessRegisterValidation = z.object({
  name: required("Business name").min(2, "Minimum 2 characters required."),
  phone: phoneField("Business phone"),
  email: required("Email").regex(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    "Please enter a valid email address.",
  ),
  registrationNo: required("Registration number"),
  panNo: required("PAN number"),
  businessLocation: required("Business location"),
  ownerName: required("Owner name"),
  ownerPhone: phoneField("Owner phone"),
  password: required("Password").min(8, "Password must be at least 8 characters."),
});

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
