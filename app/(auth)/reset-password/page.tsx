import Link from "next/link";
export default function Page() {
  return (
    <section className="border rounded-xl p-8 bg-white max-w-md">
      <h1 className="text-xl font-semibold">จัดการรหัสผ่าน</h1>
      <p className="my-4 text-sm text-neutral-500">
        กรุณาติดต่อผู้ดูแลระบบเพื่อเปลี่ยนรหัสผ่านบัญชี ERP
      </p>
      <Link href="/login" className="underline text-sm">
        กลับเข้าสู่ระบบ
      </Link>
    </section>
  );
}
