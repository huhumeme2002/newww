import { z } from "zod"

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email hoặc username là bắt buộc")
    .refine(
      (value) => {
        // Allow either email format or username format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        return emailRegex.test(value) || usernameRegex.test(value)
      },
      {
        message: "Vui lòng nhập email hợp lệ hoặc username (3-20 ký tự, chỉ chữ cái, số, _)"
      }
    ),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu quá dài"),
})

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username phải có ít nhất 3 ký tự")
    .max(20, "Username quá dài")
    .regex(/^[a-zA-Z0-9_]+$/, "Username chỉ được chứa chữ cái, số và dấu gạch dưới"),
  email: z
    .string()
    .min(1, "Email là bắt buộc")
    .email("Email không hợp lệ"),
  password: z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu quá dài"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Xác nhận mật khẩu không khớp",
  path: ["confirmPassword"],
})

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "Mật khẩu hiện tại là bắt buộc"),
  newPassword: z
    .string()
    .min(6, "Mật khẩu mới phải có ít nhất 6 ký tự")
    .max(100, "Mật khẩu quá dài"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Xác nhận mật khẩu mới không khớp",
  path: ["confirmNewPassword"],
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
