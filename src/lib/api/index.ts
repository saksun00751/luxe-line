import "server-only";
import { clearSession, readSession, writeSession } from "../session-store";
import type { SessionData } from "../session-core";
import { apiFetch, assetUrl, call, freshBackend, publicGet, type Backend } from "./client";
import { ApiError, ERROR_TH } from "./errors";
import { cleanHtml, stripHtml } from "../html";
import type {
  Balance, Bank, BankAccountLookup, ContactChannel, DepositAccount, DepositMethod, DepositMethodId, DepositSelection, LineAuthResult,
  PaymentOrder, Promotion, RealtimeConfig, PromotionList, RegisterInput, SiteBranding, Transaction, TxStatus, User, WithdrawInfo,
} from "./types";

export * from "./types";
export { ApiError, WITHDRAW_REASON_TH } from "./errors";

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const baht = (n: unknown) => num(n).toLocaleString("th-TH", { maximumFractionDigits: 2 });

/** backend ส่งเวลาเป็น "YYYY-MM-DD HH:mm:ss" ไม่ระบุ timezone — สมมติเป็นเวลาไทย (Laravel app timezone) */
const serverTime = (s?: string | null) => (s ? s.replace(" ", "T") + "+07:00" : new Date().toISOString());

type RawMember = { code: number; user_name: string };

/** ดึง Laravel session ที่เก็บไว้ (LINE ยืนยันแล้ว) มาเป็น state สำหรับยิง API ที่ต้องแก้ session */
async function storedBackend(): Promise<Backend> {
  const s = await readSession();
  if (!s) throw new ApiError(ERROR_TH.LINE_IDENTITY_REQUIRED, 428, undefined, "LINE_IDENTITY_REQUIRED");
  return { jar: { ...s.jar }, csrf: s.csrf };
}

const commit = (state: Backend, status: SessionData["status"], member?: RawMember) =>
  writeSession({ jar: state.jar, csrf: state.csrf, status, uid: member ? String(member.code) : undefined, username: member?.user_name });

const authResult = (d: { status?: string; authenticated?: boolean; member?: RawMember }): LineAuthResult =>
  d.authenticated && d.member
    ? { status: "AUTHENTICATED", member: { id: String(d.member.code), username: d.member.user_name } }
    : { status: "LINK_REQUIRED" };

const TX_STATUS: Record<number, TxStatus> = { 0: "pending", 1: "success" };
const txStatus = (code: number): TxStatus => TX_STATUS[code] ?? "rejected";

type RawWithdrawInfo = {
  balance: string; min_withdraw: string; daily_limit: string; withdrawn_today: string; daily_remaining: string;
  pending_withdrawal: boolean; game_turnover_pending: boolean; bank?: { account_masked?: string };
  passes_preliminary_checks: boolean; reasons?: string[];
};
const withdrawInfo = (d: RawWithdrawInfo): WithdrawInfo => ({
  balance: num(d.balance), min: num(d.min_withdraw), dailyLimit: num(d.daily_limit), withdrawnToday: num(d.withdrawn_today),
  dailyRemaining: num(d.daily_remaining), pending: !!d.pending_withdrawal, turnoverPending: !!d.game_turnover_pending,
  bankAccountMasked: d.bank?.account_masked ?? "", passes: !!d.passes_preliminary_checks, reasons: d.reasons ?? [],
});

type RawAccount = {
  code: number; bank_name: string; shortcode: string; acc_no: string; acc_name: string; qr_pic?: string | null;
  bank_pic?: string | null; deposit_min?: string; remark?: string | null;
};
const depositAccount = (a: RawAccount): DepositAccount => ({
  code: a.code, bankName: a.bank_name, shortcode: a.shortcode, accNo: a.acc_no, accName: a.acc_name,
  qrImageUrl: assetUrl(a.qr_pic), bankImageUrl: assetUrl(a.bank_pic), depositMin: num(a.deposit_min), remark: a.remark ?? "",
});

type RawPromo = {
  code: number; name: string; description?: string | null; image_url?: string | null; length_type?: string;
  amount_min?: string; bonus_max?: string; bonus_price?: string; bonus_percent?: string; turnover_multiplier?: string;
  can_select: boolean; selected: boolean;
};
function promotion(p: RawPromo): Promotion {
  const cond: string[] = [];
  if (num(p.amount_min) > 0) cond.push(`ฝากขั้นต่ำ ฿${baht(p.amount_min)}`);
  if (num(p.turnover_multiplier) > 0) cond.push(`เทิร์น ${baht(p.turnover_multiplier)} เท่า`);
  if (num(p.bonus_max) > 0) cond.push(`โบนัสสูงสุด ฿${baht(p.bonus_max)}`);
  return {
    code: p.code,
    title: p.name,
    description: stripHtml(p.description),
    descriptionHtml: cleanHtml(p.description),
    condition: cond.join(" · "),
    tag: p.length_type === "PERCENT" ? `โบนัส ${baht(p.bonus_percent)}%` : `โบนัส ฿${baht(p.bonus_price)}`,
    imageUrl: assetUrl(p.image_url),
    canSelect: p.can_select,
    selected: p.selected,
  };
}

/**
 * ===== Endpoint map (LineMember API v1) =====
 * ทั้งแอปเรียก backend ผ่านฟังก์ชันชุดนี้เท่านั้น — แก้ path/payload ที่นี่ที่เดียว
 * ฟังก์ชันที่แก้ session (lineAuth, link, register, logout) ต้องเรียกจาก Server Action เท่านั้น
 */
export const api = {
  // ---------- LINE auth ----------
  /** ส่ง LIFF ID token ให้ backend ตรวจ → AUTHENTICATED (เข้าสู่ระบบ) หรือ LINK_REQUIRED (ต้องผูก/สมัคร) */
  async lineAuth(idToken: string): Promise<LineAuthResult> {
    const state = await freshBackend();
    const d = await call<{ status: string; authenticated: boolean; member?: RawMember }>("/auth/line", { method: "POST", body: { id_token: idToken } }, state);
    await commit(state, d.authenticated ? "authenticated" : "pending", d.member);
    return authResult(d);
  },

  /** ผูก LINE ที่ยืนยันแล้ว (LINK_REQUIRED) เข้ากับบัญชีสมาชิกเดิมด้วย user_name + password */
  async link(userName: string, password: string): Promise<LineAuthResult> {
    const state = await storedBackend();
    const d = await call<{ status: string; authenticated: boolean; member?: RawMember }>("/auth/link", { method: "POST", body: { user_name: userName, password } }, state);
    await commit(state, d.authenticated ? "authenticated" : "pending", d.member);
    return authResult(d);
  },

  async register(input: RegisterInput): Promise<void> {
    const state = await storedBackend();
    const body = { ...input, marketing: input.marketing || undefined };
    const d = await call<{ authenticated: boolean; member?: RawMember }>("/registration/register", { method: "POST", body }, state);
    await commit(state, d.authenticated ? "authenticated" : "pending", d.member);
  },

  async logout(): Promise<void> {
    try {
      const state = await storedBackend();
      await call("/auth/logout", { method: "POST" }, state);
    } catch {
      /* ล้างเซสชันฝั่งเราอยู่ดี */
    }
    await clearSession();
  },

  // ---------- Registration ----------
  async banks(): Promise<Bank[]> {
    const d = await apiFetch<{ banks: { code: number; name_th: string; name_en: string; shortcode: string }[] }>("/registration/banks");
    return d.banks.map((b) => ({ code: b.code, nameTh: b.name_th, nameEn: b.name_en, shortcode: b.shortcode }));
  },

  /** ตรวจชื่อเจ้าของบัญชี (ต้องยืนยัน LINE แล้ว, จำกัด 4 ครั้ง/นาที) */
  async bankAccountName(bank: number, accNo: string): Promise<BankAccountLookup> {
    const d = await apiFetch<{ account_name: string; firstname: string; lastname: string; can_prefill: boolean }>("/registration/bank-account-name", {
      method: "POST",
      body: { bank, acc_no: accNo },
    });
    return { accountName: d.account_name, firstname: d.firstname, lastname: d.lastname, canPrefill: !!d.can_prefill };
  },

  async marketingValid(code: string): Promise<boolean> {
    try {
      const d = await apiFetch<{ valid: boolean }>(`/registration/marketing/${encodeURIComponent(code)}`);
      return !!d.valid;
    } catch {
      return false;
    }
  },

  // ---------- Contact ----------
  /** ช่องทางติดต่อที่ตั้งไว้ในหน้า Admin — endpoint สาธารณะ เรียกได้แม้ยังไม่ล็อกอิน */
  async contactChannels(): Promise<ContactChannel[]> {
    const d = await apiFetch<{ channels?: { code: number; type: string; label: string; link: string; sort?: number }[] }>("/contact/channels");
    return (d.channels ?? [])
      .filter((c) => c.link && c.label)
      .map((c) => ({ code: c.code, type: String(c.type ?? "").toLowerCase(), label: c.label, link: c.link.trim(), sort: num(c.sort) }))
      .sort((a, b) => a.sort - b.sort);
  },

  // ---------- Site ----------
  /** โลโก้/ชื่อเว็บ/คำอธิบายที่ตั้งไว้ในหน้า Admin — endpoint สาธารณะ แคช 5 นาที */
  async siteBranding(timeoutMs?: number): Promise<SiteBranding> {
    const d = await publicGet<{ logo?: string | null; title?: string | null; desc?: string | null; sitename?: string | null }>("/site/branding", 300, timeoutMs);
    const str = (v?: string | null) => v?.trim() || null;
    return { logo: assetUrl(str(d.logo)), title: str(d.title), desc: str(d.desc), siteName: str(d.sitename) };
  },

  // ---------- Realtime (Laravel Reverb / Pusher protocol) ----------
  async realtimeConfig(): Promise<RealtimeConfig> {
    const d = await apiFetch<{ key: string; ws_host: string; ws_port?: number | string; force_tls?: boolean; channel: string; event?: string }>("/realtime/config");
    return { key: d.key, wsHost: d.ws_host, wsPort: num(d.ws_port) || (d.force_tls === false ? 80 : 443), forceTls: d.force_tls !== false, channel: d.channel, event: d.event ?? "" };
  },
  /** ขอลายเซ็น subscribe private channel ของสมาชิก — คืนตามที่ backend ตอบ (pusher-js อ่าน field `auth`) */
  async realtimeAuth(socketId: string, channelName: string): Promise<Record<string, unknown>> {
    return apiFetch<Record<string, unknown>>("/realtime/auth", { method: "POST", body: { socket_id: socketId, channel_name: channelName } });
  },

  // ---------- Member ----------
  async profile(): Promise<User> {
    const { profile: p } = await apiFetch<{
      profile: {
        code: number; user_name: string; name: string; phone_masked: string;
        bank: { code: number; account_masked: string; name_th: string };
        wallet_snapshot: { balance: string | null; credit: string | null; bonus: string | null };
        registered_on: string; rewards?: { points?: string; diamonds?: string };
      };
    }>("/member/profile");
    return {
      id: String(p.code), username: p.user_name, name: p.name, phoneMasked: p.phone_masked,
      bankCode: p.bank.code, bankName: p.bank.name_th, accountMasked: p.bank.account_masked,
      balance: num(p.wallet_snapshot.balance), bonus: num(p.wallet_snapshot.bonus), credit: num(p.wallet_snapshot.credit),
      points: num(p.rewards?.points), diamonds: num(p.rewards?.diamonds), registeredOn: p.registered_on,
    };
  },

  async balance(): Promise<Balance> {
    const d = await apiFetch<{ retrieved_at: string; wallet: { balance: string | null }; game_accounts: { turnover_remaining: string | null }[] }>("/member/balance");
    return {
      wallet: num(d.wallet.balance),
      turnoverRemaining: d.game_accounts.reduce((s, g) => s + num(g.turnover_remaining), 0),
      retrievedAt: serverTime(d.retrieved_at),
    };
  },

  // ---------- Promotions ----------
  async promotions(): Promise<PromotionList> {
    const d = await apiFetch<{ promotions: RawPromo[]; selected: number | { code: number } | null; selection_enabled: boolean }>("/promotion/list");
    const items = d.promotions.map(promotion);
    const selected = items.find((p) => p.selected)?.code ?? (typeof d.selected === "number" ? d.selected : d.selected?.code ?? null);
    return { items, selected, selectionEnabled: !!d.selection_enabled };
  },
  async selectPromotion(code: number): Promise<void> {
    await apiFetch("/promotion/select", { method: "POST", body: { promotion: code } });
  },
  async deselectPromotion(): Promise<void> {
    await apiFetch("/promotion/deselect", { method: "POST" });
  },

  // ---------- Deposit ----------
  async depositChannels(): Promise<DepositMethod[]> {
    const d = await apiFetch<{ methods: DepositMethod[] }>("/deposit/channels");
    return d.methods.map((m) => ({ id: m.id, available: m.available, count: m.count }));
  },
  async depositSelect(method: DepositMethodId): Promise<DepositSelection> {
    const d = await apiFetch<{
      accounts: RawAccount[];
      options: { id: string; name: string; min_deposit: string; remark?: string | null }[];
    }>("/deposit/select", { method: "POST", body: { method } });
    return {
      method,
      accounts: d.accounts.map(depositAccount),
      options: d.options.map((o) => ({ id: o.id, name: o.name, minDeposit: num(o.min_deposit), remark: o.remark ?? "" })),
    };
  },
  /** สร้างออเดอร์ชำระเงิน (AdminPay) — key ต้องคงที่เมื่อ retry คำขอเดิม (12–64 ตัวอักษร) */
  async createPayment(amount: number, idempotencyKey: string): Promise<PaymentOrder> {
    const d = await apiFetch<{ transaction_id: string; amount: string; checkout_url: string; idempotency_replayed: boolean }>("/deposit/payment/create", {
      method: "POST",
      body: { provider: "adminpay", amount: amount.toFixed(2) },
      headers: { "X-Idempotency-Key": idempotencyKey },
    });
    return { transactionId: d.transaction_id, amount: num(d.amount), checkoutUrl: d.checkout_url, replayed: !!d.idempotency_replayed };
  },

  // ---------- Withdraw ----------
  async withdrawEligibility(): Promise<WithdrawInfo> {
    return withdrawInfo(await apiFetch<RawWithdrawInfo>("/withdraw/eligibility"));
  },
  /** ตรวจยอดที่กรอก (ไม่ตัดเงิน) — passes=false พร้อม reasons[] ถ้าไม่ผ่าน */
  async withdrawQuote(amount: number): Promise<WithdrawInfo> {
    return withdrawInfo(await apiFetch<RawWithdrawInfo>("/withdraw/quote", { method: "POST", body: { amount: amount.toFixed(2) } }));
  },
  /** ยื่นถอนจริง — จำนวนเต็มบาทเท่านั้น, key ต้องคงที่เมื่อ retry */
  async withdrawSubmit(amount: number, idempotencyKey: string): Promise<{ replayed: boolean }> {
    const d = await apiFetch<{ idempotency_replayed: boolean }>("/withdraw/submit", {
      method: "POST",
      body: { amount: String(Math.trunc(amount)) },
      headers: { "X-Idempotency-Key": idempotencyKey },
    });
    return { replayed: !!d.idempotency_replayed };
  },

  // ---------- History ----------
  async transactions(type: "deposit" | "withdraw", limit = 20): Promise<Transaction[]> {
    const path = type === "deposit" ? "/transactions/deposits" : "/transactions/withdrawals";
    const d = await apiFetch<{ items: { id: number; amount: string; bonus?: string; status_code: number; recorded_at: string }[] }>(path, {
      query: { limit, mode: type === "withdraw" ? "standard" : undefined },
    });
    return d.items.map((x) => ({
      id: `${type}-${x.id}`, type, amount: num(x.amount), bonus: x.bonus != null ? num(x.bonus) : undefined,
      status: txStatus(x.status_code), createdAt: serverTime(x.recorded_at),
    }));
  },

  // ---------- Game ----------
  /** ขอ URL เข้าเกม UFA — ห้าม log/เก็บ URL นี้ (มี token) ให้ redirect ทันที */
  async gameLogin(): Promise<{ url: string }> {
    const d = await apiFetch<{ game_url: string }>("/game/login", { method: "POST" });
    return { url: d.game_url };
  },
};
