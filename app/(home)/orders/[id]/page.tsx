import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { OrderDetail } from "@/features/orders/components/OrderDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <PageHeader
        title="รายละเอียดใบสั่งขาย"
        description="ดูข้อมูลรายการสินค้า ลูกค้า และสถานะของคำสั่งซื้อ"
      />
      <OrderDetail orderId={id} />
    </PageContainer>
  );
}
