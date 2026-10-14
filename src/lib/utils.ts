import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatBaht = (n: number, digits = 2) =>
  n.toLocaleString("th-TH", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const formatDateTH = (iso: string) =>
  new Date(iso).toLocaleString("th-TH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });

/** วันที่แบบ YYYY-MM-DD (จาก backend) → รูปแบบไทย */
export const formatDate = (ymd: string) =>
  new Date(ymd + "T00:00:00+07:00").toLocaleDateString("th-TH", { dateStyle: "medium", timeZone: "Asia/Bangkok" });
