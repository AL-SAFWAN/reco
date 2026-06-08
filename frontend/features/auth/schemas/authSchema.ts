import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormInputs = z.infer<typeof loginSchema>

export const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export type EmailFormInputs = z.infer<typeof emailSchema>

export const otpSchema = z.object({
  otp: z
    .string()
    .regex(/^\d+$/, "OTP must contain only digits.")
    .length(6, "OTP must be exactly 6 digits."),
  email: z.string().optional(),
})

export type OTPFormInputs = z.infer<typeof otpSchema>

export const signUpSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z
      .string()
      .email("Invalid email address")
      .max(255, "Email must be less than 255 characters"),
    password: z
      .string()
      .min(1, "Password is required")
      .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, ""),
    confirmPassword: z.string().min(1, "Enter password again"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type SignUpFormInputs = z.infer<typeof signUpSchema>

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, "Password is required")
      .regex(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/, ""),
    confirmPassword: z.string().min(1, "Enter password again"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

export type ResetPasswordInputs = z.infer<typeof resetPasswordSchema>

export const CompleteAcctSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

export type CompleteAcctInputs = z.infer<typeof CompleteAcctSchema>
