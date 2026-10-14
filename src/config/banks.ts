/** สีประจำธนาคาร (key = shortcode จาก /registration/banks) — รายชื่อธนาคารจริงมาจาก API */
const COLORS: Record<string, string> = {
  KBANK: "#138f2d", SCB: "#4e2e7f", BBL: "#1e4598", KTB: "#1ba5e1", BAY: "#fec43b", TTB: "#0050f0",
  GSB: "#eb198d", BAAC: "#4b9b1d", UOB: "#0b3979", KKP: "#635a8e", CIMB: "#7e2f36", GHBANK: "#f26f21", TRUEWALLET: "#f58220",
};

export const bankColor = (shortcode?: string) => COLORS[(shortcode ?? "").toUpperCase()] ?? "#888";
