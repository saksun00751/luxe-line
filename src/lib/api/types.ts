/**
 * Domain types ที่ UI ใช้ (แปลงมาจาก response ของ LineMember API แล้ว)
 * จำนวนเงินจาก backend เป็น decimal string — ที่นี่แปลงเป็น number เพื่อแสดงผลเท่านั้น
 * ตอนส่งไป backend ให้ส่งเป็น string เสมอ
 */
export type User = {
  id: string; // members.code
  username: string; // user_name (มักเป็นเบอร์โทร)
  name: string;
  phoneMasked: string;
  bankCode: number;
  bankName: string;
  accountMasked: string;
  balance: number;
  bonus: number;
  credit: number;
  points: number;
  diamonds: number;
  registeredOn: string; // YYYY-MM-DD
};

export type Balance = {
  wallet: number;
  /** ผลรวมเทิร์นโอเวอร์ที่เหลือของบัญชีเกมทั้งหมด */
  turnoverRemaining: number;
  retrievedAt: string;
};

export type LineAuthResult = { status: "AUTHENTICATED" | "LINK_REQUIRED"; member?: { id: string; username: string } };

export type Bank = { code: number; nameTh: string; nameEn: string; shortcode: string };

export type BankAccountLookup = { accountName: string; firstname: string; lastname: string; canPrefill: boolean };

export type RegisterInput = {
  user_name: string;
  firstname: string;
  lastname: string;
  bank: number;
  acc_no: string;
  password: string;
  password_confirmation: string;
  marketing?: string | null;
};

export type Promotion = {
  code: number;
  title: string;
  description: string; // ข้อความล้วน (ไม่มีแท็ก)
  descriptionHtml: string; // HTML ที่ sanitize แล้ว — แสดงด้วย dangerouslySetInnerHTML ได้
  condition: string;
  tag: string;
  imageUrl: string | null;
  canSelect: boolean;
  selected: boolean;
};

export type PromotionList = { items: Promotion[]; selected: number | null; selectionEnabled: boolean };

export type DepositMethodId = "bank" | "tw" | "payment" | "slip";
export type DepositMethod = { id: DepositMethodId; available: boolean; count: number };

export type DepositAccount = {
  code: number;
  bankName: string;
  shortcode: string;
  accNo: string;
  accName: string;
  qrImageUrl: string | null;
  bankImageUrl: string | null;
  depositMin: number;
  remark: string;
};
export type PaymentOption = { id: string; name: string; minDeposit: number; remark: string };
export type DepositSelection = { method: DepositMethodId; accounts: DepositAccount[]; options: PaymentOption[] };

export type PaymentOrder = { transactionId: string; amount: number; checkoutUrl: string; replayed: boolean };

export type WithdrawInfo = {
  balance: number;
  min: number;
  dailyLimit: number;
  withdrawnToday: number;
  dailyRemaining: number;
  pending: boolean;
  turnoverPending: boolean;
  bankAccountMasked: string;
  passes: boolean;
  reasons: string[];
};

export type TxType = "deposit" | "withdraw";
export type TxStatus = "pending" | "success" | "rejected";
export type Transaction = { id: string; type: TxType; amount: number; bonus?: number; status: TxStatus; createdAt: string };

/** ช่องทางติดต่อจากหน้า Admin (public — ไม่ต้องล็อกอิน) */
export type ContactChannel = { code: number; type: string; label: string; link: string; sort: number };

/** ค่าเชื่อม Reverb/Pusher จาก /realtime/config (ชื่อ field ตาม API doc) */
export type RealtimeConfig = {
  key: string;
  wsHost: string;
  wsPort: number;
  forceTls: boolean;
  channel: string;
  event: string;
};

/** แบรนด์เว็บไซต์จาก /site/branding (public) — ค่าที่ backend ไม่ส่งมาเป็น null */
export type SiteBranding = { logo: string | null; title: string | null; desc: string | null; siteName: string | null };
