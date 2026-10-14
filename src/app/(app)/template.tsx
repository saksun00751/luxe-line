/** template ถูกสร้างใหม่ทุกครั้งที่เปลี่ยนหน้า (รวมกดย้อนกลับ) → เนื้อหาเฟดเข้าแทนการสลับทันที */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in slide-in-from-bottom-1 duration-300 ease-out motion-reduce:animate-none">{children}</div>;
}
