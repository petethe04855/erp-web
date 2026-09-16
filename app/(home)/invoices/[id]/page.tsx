import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { InvoiceDetail } from "@/features/invoices/components/InvoiceDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <PageHeader
        title="รายละเอียดใบแจ้งหนี้"
        description="ดูรายการสินค้า ยอดคงค้าง และประวัติการออกใบแจ้งหนี้"
      />
      <InvoiceDetail invoiceId={id} />
    </PageContainer>
  );
}
