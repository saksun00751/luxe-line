import "server-only";
import sanitizeHtml from "sanitize-html";
import { assetUrl } from "./api/client";

/**
 * ข้อความจากฐานข้อมูลของ backend (เช่น description ของโปรโมชั่น) อาจเป็น HTML — ต้อง sanitize ก่อนแสดง
 * อนุญาตเฉพาะแท็กจัดรูปแบบพื้นฐาน, ตัด style/script/event handler, ลิงก์เปิดแท็บใหม่ (http/https/tel/mailto เท่านั้น)
 */
export function cleanHtml(input?: string | null): string {
  if (!input) return "";
  // ข้อความธรรมดา (ไม่มีแท็ก) → คงการขึ้นบรรทัดใหม่
  const html = /<[a-z!/][\s\S]*>/i.test(input) ? input : input.replace(/\r?\n/g, "<br>");
  return sanitizeHtml(html, {
    allowedTags: ["p", "br", "hr", "b", "strong", "i", "em", "u", "s", "small", "sub", "sup", "span", "div", "blockquote", "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "a", "img", "table", "thead", "tbody", "tr", "th", "td"],
    allowedAttributes: { a: ["href", "target", "rel"], img: ["src", "alt", "width", "height", "loading"], th: ["colspan", "rowspan"], td: ["colspan", "rowspan"] },
    allowedSchemes: ["http", "https", "tel", "mailto"],
    allowedSchemesByTag: { img: ["http", "https"] },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { target: "_blank", rel: "noopener noreferrer" }),
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, src: assetUrl(attribs.src) ?? "", loading: "lazy" } }),
    },
  });
}

/** ตัดแท็กออกหมด เหลือแต่ข้อความ */
export const stripHtml = (input?: string | null) => sanitizeHtml(input ?? "", { allowedTags: [], allowedAttributes: {} }).replace(/\s+/g, " ").trim();
