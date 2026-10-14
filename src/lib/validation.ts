import { z } from "zod";

const NAME = /^[\p{L}\p{M}\s-]+$/u;

export const registerSchema = z
  .object({
    // API: ^0[0-9]{9}$ (ตัด - และช่องว่างให้ก่อน)
    user_name: z.string().trim().transform((v) => v.replace(/[\s-]/g, "")).pipe(z.string().regex(/^0\d{9}$/, "เบอร์โทรไม่ถูกต้อง (10 หลัก ขึ้นต้นด้วย 0)")),
    // API: 1–20 ตัวอักษร Unicode / ช่องว่าง / ขีดกลาง
    firstname: z.string().trim().min(1, "กรุณากรอกชื่อ").max(20, "ไม่เกิน 20 ตัวอักษร").regex(NAME, "ใช้ได้เฉพาะตัวอักษร ช่องว่าง และขีดกลาง"),
    lastname: z.string().trim().min(1, "กรุณากรอกนามสกุล").max(20, "ไม่เกิน 20 ตัวอักษร").regex(NAME, "ใช้ได้เฉพาะตัวอักษร ช่องว่าง และขีดกลาง"),
    bank: z.coerce.number({ message: "กรุณาเลือกธนาคาร" }).int().positive("กรุณาเลือกธนาคาร"),
    acc_no: z.string().trim().transform((v) => v.replace(/\D/g, "")).pipe(z.string().regex(/^\d{8,20}$/, "เลขบัญชีไม่ถูกต้อง (8–20 หลัก)")),
    password: z.string().min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร").max(64, "รหัสผ่านต้องไม่เกิน 64 ตัวอักษร"),
    password_confirmation: z.string(),
    accept: z.literal("on", { message: "กรุณายอมรับเงื่อนไข" }),
    idToken: z.string().optional(),
    marketing: z.string().trim().max(40).optional(),
  })
  .refine((d) => d.password === d.password_confirmation, { path: ["password_confirmation"], message: "รหัสผ่านไม่ตรงกัน" })
  .refine((d) => d.password !== d.user_name && d.password !== d.acc_no, { path: ["password"], message: "รหัสผ่านต้องไม่ตรงกับเบอร์โทรหรือเลขบัญชี" });

/** ผูก LINE เข้ากับบัญชีเดิมด้วย username/password */
export const linkSchema = z.object({
  user_name: z.string().trim().min(1, "กรุณากรอกชื่อผู้ใช้").max(100),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน").max(128),
  idToken: z.string().optional(),
  next: z.string().optional(),
});

/** เปลี่ยนรหัสผ่านสมาชิก (ยังเป็น mock — ยังไม่มี endpoint ฝั่ง backend) */
export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, "กรุณากรอกรหัสผ่านปัจจุบัน").max(128),
    password: z.string().min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร").max(64, "รหัสผ่านต้องไม่เกิน 64 ตัวอักษร"),
    password_confirmation: z.string(),
  })
  .refine((d) => d.password === d.password_confirmation, { path: ["password_confirmation"], message: "รหัสผ่านไม่ตรงกัน" })
  .refine((d) => d.password !== d.current_password, { path: ["password"], message: "รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม" });

export const amountSchema = z.coerce.number({ message: "กรุณากรอกจำนวนเงิน" }).int("จำนวนเงินต้องเป็นจำนวนเต็ม").positive("จำนวนเงินต้องมากกว่า 0");

export type FormState = { ok?: boolean; message?: string; fieldErrors?: Record<string, string>; values?: Record<string, string> };

export const flatErrors = (e: z.ZodError) => {
  const out: Record<string, string> = {};
  for (const i of e.issues) {
    const k = String(i.path[0] ?? "form");
    out[k] ??= i.message;
  }
  return out;
};
