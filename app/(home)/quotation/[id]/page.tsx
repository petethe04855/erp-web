import React from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { QuotationDetail } from "@/features/quotation/components/QuotationDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QuotationDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PageContainer>
      <PageHeader
        title="รายละเอียดใบเสนอราคา"
        description="ดูรายละเอียดรายการสินค้า เงื่อนไข และระยะเวลาการเสนอราคา"
      />
      <QuotationDetail quotationId={id} />
    </PageContainer>
  );
}
