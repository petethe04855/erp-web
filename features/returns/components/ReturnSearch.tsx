import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FilterToolbar } from "@/components/common/FilterToolbar";

interface ReturnSearchProps {
  search: string;
  status: string;
  returnType: string;
  onSearch: (val: string) => void;
  onStatusChange: (val: string) => void;
  onReturnTypeChange: (val: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

export function ReturnSearch(props: ReturnSearchProps) {
  let activeCount = 0;
  if (props.search) activeCount++;
  if (props.status && props.status !== "all") activeCount++;
  if (props.returnType && props.returnType !== "all") activeCount++;

  return (
    <FilterToolbar
      onReset={props.onReset}
      activeFilterCount={activeCount}
      actions={props.actions || props.children}
    >
      <div className="relative min-w-[240px] flex-1 sm:max-w-xs">
        <Input
          type="search"
          className="h-9 text-xs"
          value={props.search}
          onChange={(e) => props.onSearch(e.target.value)}
          placeholder="ค้นหาเลขที่ใบรับคืน / ชื่อลูกค้า / ออเดอร์..."
        />
      </div>

      <div className="w-full sm:w-48">
        <Select
          className="h-9 text-xs"
          value={props.status}
          onChange={(e) => props.onStatusChange(e.target.value)}
        >
          <option value="all">สถานะทั้งหมด</option>
          <option value="DRAFT">ฉบับร่าง (DRAFT)</option>
          <option value="SUBMITTED">ส่งอนุมัติ (SUBMITTED)</option>
          <option value="APPROVED">อนุมัติแล้ว (APPROVED)</option>
          <option value="COMPLETED">ตรวจรับแล้ว (COMPLETED)</option>
          <option value="REJECTED">ปฏิเสธ (REJECTED)</option>
          <option value="CANCELLED">ยกเลิก (CANCELLED)</option>
        </Select>
      </div>

      <div className="w-full sm:w-44">
        <Select
          className="h-9 text-xs"
          value={props.returnType}
          onChange={(e) => props.onReturnTypeChange(e.target.value)}
        >
          <option value="all">ประเภททั้งหมด</option>
          <option value="CUSTOMER">ลูกค้าคืน (CUSTOMER)</option>
          <option value="INTERNAL">คืนภายใน (INTERNAL)</option>
        </Select>
      </div>
    </FilterToolbar>
  );
}
