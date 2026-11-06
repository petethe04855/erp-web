"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProductsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/sku");
  }, [router]);

  return null;
}
