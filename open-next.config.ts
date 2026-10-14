import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// ทุกหน้าเป็น dynamic (ใช้ session cookie) จึงไม่ต้องใช้ incremental cache / KV
export default defineCloudflareConfig();
