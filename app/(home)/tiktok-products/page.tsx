"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CircleAlert, PackageSearch, RefreshCw, Search } from "lucide-react";
import { Card, TopBar } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { readApiResponse } from "@/lib/apiResponse";
import { useTheme } from "@/lib/design/ThemeContext";

type UnknownRecord = Record<string, any>;
type TikTokProduct = {
  id: string;
  name: string;
  status: string;
  skus: string[];
  stock: number | null;
  price: string;
};

const getApiUrl = () =>
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
  const token =
    typeof window === "undefined" ? "" : localStorage.getItem("chawy_token");
  return { Authorization: token ? `Bearer ${token}` : "" };
}

function asRecord(value: unknown): UnknownRecord {
  return typeof value === "object" && value !== null
    ? (value as UnknownRecord)
    : {};
}

function asString(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : "";
}

function asNumber(value: unknown): number | null {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : null;
}

function stockFromRecord(record: UnknownRecord): number | null {
  for (const value of [
    record.available_stock,
    record.available_quantity,
    record.stock,
    record.quantity,
  ]) {
    const stock = asNumber(value);
    if (stock !== null) return stock;
  }
  const inventoryEntries = Array.isArray(record.inventory)
    ? record.inventory.map(asRecord)
    : [];
  const inventoryQuantity = inventoryEntries
    .map((item) => asNumber(item.quantity))
    .filter((quantity): quantity is number => quantity !== null);
  if (inventoryQuantity.length) {
    return inventoryQuantity.reduce((total, quantity) => total + quantity, 0);
  }

  const inventory = asRecord(record.inventory || record.stock_info);
  for (const value of [
    inventory.available_stock,
    inventory.available_quantity,
    inventory.stock,
    inventory.quantity,
  ]) {
    const stock = asNumber(value);
    if (stock !== null) return stock;
  }
  return null;
}

function extractProducts(payload: unknown): {
  products: TikTokProduct[];
  total: number;
} {
  const data = asRecord(payload);
  const nested = asRecord(data.data);
  const source = [
    data.products,
    data.product_list,
    nested.products,
    nested.product_list,
  ].find(Array.isArray) as unknown[] | undefined;
  const products = (source ?? []).map((item) => {
    const product = asRecord(item);
    const skuItems = Array.isArray(product.skus) ? product.skus : [];
    const skus = skuItems
      .map((sku) => {
        const value = asRecord(sku);
        return asString(value.seller_sku || value.sku_id || value.id);
      })
      .filter(Boolean);
    const skuStocks = skuItems
      .map((sku) => stockFromRecord(asRecord(sku)))
      .filter((stock): stock is number => stock !== null);
    const skuStock = skuStocks.length
      ? skuStocks.reduce((total, stock) => total + stock, 0)
      : null;
    const firstSkuPrice = skuItems[0]
      ? asRecord(asRecord(skuItems[0]).price)
      : {};
    const rawPrice =
      product.price?.tax_exclusive_price || firstSkuPrice.tax_exclusive_price;

    return {
      id: asString(product.product_id || product.id),
      name: asString(product.title || product.name) || "Untitled product",
      status: asString(product.status) || "-",
      skus,
      stock: stockFromRecord(product) ?? skuStock,
      price: asString(rawPrice) || "-",
    };
  });
  const total = Number(
    data.total_count || data.total || nested.total_count || nested.total,
  );
  return {
    products,
    total: Number.isFinite(total) && total >= 0 ? total : products.length,
  };
}

export default function TikTokProductsPage() {
  const { tokens: t } = useTheme();
  const c = t.color;
  const [products, setProducts] = useState<TikTokProduct[]>([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [rawResponse, setRawResponse] = useState<unknown>(null);
  const [outgoingRequest, setOutgoingRequest] = useState<unknown>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${getApiUrl()}/api/tiktok/products?status=ACTIVATE&page_size=100&debug=true`,
        { headers: authHeaders(), cache: "no-store" },
      );
      const payload = await readApiResponse<unknown>(response);
      const debugPayload = asRecord(payload);
      const tiktokResponse = debugPayload.response ?? payload;
      const result = extractProducts(tiktokResponse);
      setProducts(result.products);
      setTotalProducts(result.total);
      setRawResponse(tiktokResponse);
      setOutgoingRequest(debugPayload.outgoingRequest ?? null);
    } catch (err) {
      setProducts([]);
      setTotalProducts(0);
      setRawResponse(null);
      setOutgoingRequest(null);
      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถดึงสินค้าจาก TikTok Shop ได้",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return products;
    return products.filter((product) =>
      [product.name, product.id, ...product.skus].some((value) =>
        value.toLowerCase().includes(needle),
      ),
    );
  }, [products, query]);
  const totalStock = useMemo(
    () => products.reduce((total, product) => total + (product.stock ?? 0), 0),
    [products],
  );

  return (
    <div className="min-h-screen pb-16" style={{ background: c.canvas }}>
      <TopBar
        t={t}
        breadcrumb={["Chawy", "Channels", "TikTok Products"]}
        title="สินค้า TikTok Shop"
        subtitle="รายการสินค้าจากร้าน TikTok ที่เชื่อมต่ออยู่"
        right={
          <Button
            onClick={() => void loadProducts()}
            disabled={loading}
            className="gap-2 border-none bg-[var(--erp-accent)] text-white shadow-none hover:opacity-90"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            รีเฟรชสินค้า
          </Button>
        }
      />

      <div className="mx-auto flex max-w-full flex-col gap-6 p-6 md:p-8">
        <Card
          t={t}
          className="border p-5"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex items-center gap-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--erp-accent-soft)] text-[var(--erp-accent)]">
                <PackageSearch size={21} />
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--erp-ink)" }}
                >
                  {totalStock}
                </p>
                <p className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                  คงเหลือรวม
                </p>
              </div>
              <div>
                <p
                  className="text-2xl font-bold"
                  style={{ color: "var(--erp-ink)" }}
                >
                  {totalProducts}
                </p>
                <p className="text-xs" style={{ color: "var(--erp-ink3)" }}>
                  สินค้าที่ดึงจาก TikTok Shop
                </p>
              </div>
            </div>
            <div className="relative w-full md:max-w-sm">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "var(--erp-ink3)" }}
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="ค้นหาชื่อสินค้า, Product ID หรือ SKU"
                className="pl-9"
              />
            </div>
          </div>
        </Card>

        {error && (
          <div
            className="flex gap-3 rounded-xl border p-4 text-sm"
            style={{
              borderColor: `${c.neg}55`,
              color: c.neg,
              background: `${c.neg}0d`,
            }}
          >
            <CircleAlert size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <Card
          t={t}
          className="overflow-hidden border"
          style={{
            borderColor: "var(--erp-border)",
            background: "var(--erp-surface)",
          }}
        >
          <div
            className="border-b px-5 py-3 text-xs"
            style={{
              borderColor: "var(--erp-border)",
              color: "var(--erp-ink3)",
            }}
          >
            แสดง {filteredProducts.length} จาก {totalProducts} รายการ
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>สินค้า</TableHead>
                <TableHead>Product ID</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>ราคา</TableHead>
                <TableHead>คงเหลือ</TableHead>
                <TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    กำลังดึงสินค้าจาก TikTok Shop...
                  </TableCell>
                </TableRow>
              ) : filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm"
                    style={{ color: "var(--erp-ink3)" }}
                  >
                    ไม่พบสินค้า
                    {query
                      ? "ที่ตรงกับคำค้นหา"
                      : " หรือร้านค้ายังไม่ได้เชื่อมต่อ"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id || product.name}>
                    <TableCell
                      className="font-semibold"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {product.name}
                    </TableCell>
                    <TableCell
                      className="font-mono text-xs"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {product.id || "-"}
                    </TableCell>
                    <TableCell
                      className="text-xs"
                      style={{ color: "var(--erp-ink3)" }}
                    >
                      {product.skus.join(", ") || "-"}
                    </TableCell>
                    <TableCell
                      className="font-semibold"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {product.price ?? "-"}
                    </TableCell>
                    <TableCell
                      className="font-semibold"
                      style={{ color: "var(--erp-ink)" }}
                    >
                      {product.stock ?? "-"}
                    </TableCell>
                    <TableCell>
                      <span className="rounded-full bg-[var(--erp-accent-soft)] px-2 py-1 text-xs font-semibold text-[var(--erp-accent)]">
                        {product.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        {/* {rawResponse !== null && (
          <details className="rounded-xl border p-4" style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}>
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--erp-ink)" }}>
              API response — /api/tiktok/products?status=ACTIVATE&page_size=100
            </summary>
            <pre className="mt-4 max-h-[480px] overflow-auto rounded-lg p-4 text-xs" style={{ color: "var(--erp-ink)", background: "var(--erp-canvas)" }}>
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        )} */}

        {/* {outgoingRequest !== null && (
          <details className="rounded-xl border p-4" style={{ borderColor: "var(--erp-border)", background: "var(--erp-surface)" }}>
            <summary className="cursor-pointer text-sm font-semibold" style={{ color: "var(--erp-ink)" }}>
              Outgoing request (redacted)
            </summary>
            <pre className="mt-4 max-h-[480px] overflow-auto rounded-lg p-4 text-xs" style={{ color: "var(--erp-ink)", background: "var(--erp-canvas)" }}>
              {JSON.stringify(outgoingRequest, null, 2)}
            </pre>
          </details>
        )} */}
      </div>
    </div>
  );
}
