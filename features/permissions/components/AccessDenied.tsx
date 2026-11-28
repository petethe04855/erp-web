import { ShieldAlert } from "lucide-react";

export function AccessDenied({
  message = "บัญชีของคุณยังไม่ได้รับสิทธิ์เข้าหน้านี้ กรุณาติดต่อเจ้าของกิจการ (Owner) หากต้องการใช้งาน",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
        <ShieldAlert className="h-7 w-7" />
      </div>
      <h2 className="text-base font-bold text-neutral-900">
        ไม่มีสิทธิ์เข้าถึงหน้านี้
      </h2>
      <p className="mt-1.5 max-w-md text-xs text-neutral-500">{message}</p>
    </div>
  );
}
