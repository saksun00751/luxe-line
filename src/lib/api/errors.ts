export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  constructor(message: string, status = 400, fieldErrors?: Record<string, string>, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.code = code;
  }
}

/** ข้อความภาษาไทยสำหรับ error code ของ LineMember API (ถ้าไม่มีในตารางนี้จะใช้ message จาก backend) */
export const ERROR_TH: Record<string, string> = {
  UNAUTHENTICATED: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่",
  LINE_IDENTITY_REQUIRED: "กรุณายืนยันตัวตนผ่าน LINE ใหม่อีกครั้ง",
  INVALID_LINE_TOKEN: "ยืนยัน LINE ไม่สำเร็จ กรุณาเปิดผ่านแอป LINE แล้วลองใหม่",
  INVALID_CREDENTIALS: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง",
  MEMBER_UNAVAILABLE: "บัญชีนี้ไม่สามารถใช้งานได้ กรุณาติดต่อพนักงาน",
  MEMBER_ALREADY_LINKED: "บัญชีนี้ผูกกับ LINE อื่นอยู่แล้ว กรุณาติดต่อพนักงาน",
  LINE_ALREADY_LINKED: "LINE นี้ผูกกับบัญชีสมาชิกอยู่แล้ว",
  LINE_LINK_CONFLICT: "ไม่สามารถผูกบัญชีได้ในขณะนี้ กรุณาลองใหม่",
  ACCOUNT_SWITCH_REQUIRES_LOGOUT: "กรุณาออกจากระบบก่อนสลับบัญชี",
  ACCOUNT_ALREADY_AUTHENTICATED: "คุณเข้าสู่ระบบอยู่แล้ว",
  REGISTRATION_NOT_READY: "ระบบสมัครสมาชิกยังไม่เปิดให้บริการ กรุณาติดต่อพนักงาน",
  REGISTRATION_CONFLICT: "ข้อมูลนี้ถูกใช้สมัครแล้ว (เบอร์โทรหรือเลขบัญชีซ้ำ)",
  UNSUPPORTED_BANK: "ไม่รองรับธนาคารนี้",
  BANK_NAME_LOOKUP_FAILED: "ตรวจสอบชื่อบัญชีไม่สำเร็จ กรุณากรอกข้อมูลอีกครั้ง",
  BANK_NAME_SERVICE_NOT_READY: "บริการตรวจชื่อบัญชียังไม่พร้อม",
  PROVIDER_UNAVAILABLE: "ระบบไม่พร้อมใช้งานชั่วคราว กรุณาลองใหม่ภายหลัง",
  PROVIDER_NOT_CONFIGURED: "ระบบ LINE Login ยังไม่ได้ตั้งค่า กรุณาติดต่อพนักงาน",
  LINE_UNAVAILABLE: "ไม่สามารถเชื่อมต่อ LINE ได้ในขณะนี้",
  PROMOTION_NOT_FOUND: "ไม่พบโปรโมชั่นนี้ กรุณารีเฟรชหน้า",
  PROMOTION_DISABLED: "โปรโมชั่นนี้ปิดรับแล้ว",
  PROMOTION_INELIGIBLE: "คุณไม่เข้าเงื่อนไขโปรโมชั่นนี้",
  DEPOSIT_CHANNEL_UNAVAILABLE: "ช่องทางฝากนี้ยังไม่เปิดให้บริการ",
  PAYMENT_ORDER_NOT_FOUND: "ไม่พบรายการชำระเงิน",
  PAYMENT_PROVIDER_UNAVAILABLE: "ผู้ให้บริการชำระเงินไม่พร้อมใช้งาน กรุณาลองใหม่",
  PAYMENT_BELOW_MINIMUM: "ยอดฝากต่ำกว่าขั้นต่ำของช่องทางนี้",
  IDEMPOTENCY_KEY_CONFLICT: "รายการซ้ำกับคำขอก่อนหน้า กรุณารีเฟรชหน้าแล้วลองใหม่",
  MONEY_REQUEST_REQUIRES_REVIEW: "รายการนี้อยู่ระหว่างตรวจสอบ กรุณาติดต่อพนักงาน",
  MONEY_API_NOT_READY: "ระบบฝาก-ถอนยังไม่เปิดให้บริการ กรุณาติดต่อพนักงาน",
  PAYMENT_PROVIDER_NOT_READY: "ช่องทางชำระเงินยังไม่พร้อมใช้งาน",
  PAYMENT_RECONCILIATION_REQUIRED: "มีรายการก่อนหน้ากำลังตรวจสอบ กรุณารอสักครู่ ห้ามทำรายการซ้ำ",
  WITHDRAW_INELIGIBLE: "ยังไม่สามารถถอนได้ในขณะนี้",
  WITHDRAW_ALL_REQUIRED: "ต้องถอนทั้งจำนวนที่เหลือ",
  WITHDRAW_WHOLE_BAHT_REQUIRED: "ถอนได้เฉพาะจำนวนเต็มบาท",
  WITHDRAW_WRITE_FAILED: "บันทึกรายการถอนไม่สำเร็จ กรุณาตรวจสอบประวัติก่อนทำรายการซ้ำ",
  GAME_ACCOUNT_NOT_READY: "บัญชีเกมของคุณยังไม่พร้อม กรุณาติดต่อพนักงาน",
  GAME_PROVIDER_NOT_READY: "ระบบเกมยังไม่พร้อมใช้งาน",
  GAME_MODE_UNSUPPORTED: "ระบบเกมยังไม่พร้อมใช้งาน",
  GAME_LOGIN_FAILED: "เข้าเกมไม่สำเร็จ กรุณาลองใหม่",
  GAME_LOGIN_UNAVAILABLE: "เข้าเกมไม่ได้ในขณะนี้ กรุณาลองใหม่ภายหลัง",
  MARKETING_LINK_INVALID: "ลิงก์สมัครไม่ถูกต้องหรือหมดอายุ",
};

/** เหตุผลจาก /withdraw/quote → ข้อความไทย */
export const WITHDRAW_REASON_TH: Record<string, string> = {
  UNSUPPORTED_WITHDRAW_MODE: "บัญชีนี้ยังไม่รองรับการถอนผ่านหน้านี้",
  BANK_ACCOUNT_UNAVAILABLE: "ไม่พบบัญชีธนาคารที่ลงทะเบียนไว้",
  WITHDRAW_SETTINGS_UNAVAILABLE: "ระบบถอนยังไม่พร้อมใช้งาน",
  PENDING_WITHDRAWAL: "มีรายการถอนที่กำลังดำเนินการอยู่",
  GAME_TURNOVER_PENDING: "ยอดเทิร์นโอเวอร์ยังไม่ครบ หรือยังมียอดค้างในเกม",
  INVALID_AMOUNT: "จำนวนเงินไม่ถูกต้อง",
  WITHDRAW_WHOLE_BAHT_REQUIRED: "ถอนได้เฉพาะจำนวนเต็มบาท",
  BELOW_MINIMUM: "ต่ำกว่ายอดถอนขั้นต่ำ",
  INSUFFICIENT_BALANCE: "ยอดเงินไม่เพียงพอ",
  DAILY_LIMIT_EXCEEDED: "เกินวงเงินถอนต่อวัน",
};
