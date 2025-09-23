import { z } from "zod"

export const exchangeRequestSchema = z.object({
  requestAmount: z
    .number()
    .min(1, "Số request phải lớn hơn 0")
    .max(10000, "Số request không được vượt quá 10,000")
    .int("Số request phải là số nguyên"),
})

export const redeemKeySchema = z.object({
  keyValue: z
    .string()
    .min(1, "Key không được để trống")
    .regex(/^VIP-[A-Z0-9]{6}-[A-Z0-9]{6}$/, "Format key không đúng (VIP-XXXXXX-XXXXXX)"),
})

export const createKeySchema = z.object({
  requests: z
    .number()
    .min(1, "Số request phải lớn hơn 0")
    .max(100000, "Số request không được vượt quá 100,000")
    .int("Số request phải là số nguyên"),
  description: z
    .string()
    .max(200, "Mô tả quá dài")
    .optional(),
  expiresAt: z
    .date()
    .min(new Date(), "Ngày hết hạn phải sau ngày hiện tại")
    .optional(),
  keyType: z.enum(["REGULAR", "CUSTOM"]).default("REGULAR"),
})

export type ExchangeRequestInput = z.infer<typeof exchangeRequestSchema>
export type RedeemKeyInput = z.infer<typeof redeemKeySchema>
export type CreateKeyInput = z.infer<typeof createKeySchema>
