import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SKUSelect } from "@/features/sku/components/SKUSelect";
import * as skuQueries from "@/features/sku/queries/skuQueries";
import * as stockQueries from "@/features/inventory/queries/useStockBySKU";
import * as inventoryQueries from "@/features/inventory/queries/inventoryQueries";

describe("SKUSelect with Inventory Stock", () => {
  it("displays inventory stock in options and detail chips and passes augmented stock on change", () => {
    // Mock SKU Master list
    vi.spyOn(skuQueries, "useSKUListQuery").mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            sku: "SKU-001",
            name: "Item Alpha",
            category: "Finished Product",
            price: 150,
            cost: 80,
            isBundle: false,
            status: "active",
            availableStock: 5, // old value from master
            stockQuantity: 5,
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);

    // Mock Inventory Stock (by SKU)
    const stockMap = new Map();
    stockMap.set("SKU-001", {
      available: 25, // actual inventory available
      reserved: 2,
      onHand: 27,
      warehouseCount: 2,
    });

    vi.spyOn(stockQueries, "useStockBySKU").mockReturnValue({
      stockMap,
      getStockForSKU: (code: string) => stockMap.get(code.toUpperCase().trim()),
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    const onChange = vi.fn();
    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <SKUSelect value="SKU-001" onChange={onChange} />
      </QueryClientProvider>
    );

    // Check that the dropdown option text includes real inventory available stock
    expect(screen.getByText(/พร้อมส่ง 25/)).toBeDefined();

    // Check that the selected SKU detail chip reflects real inventory stock
    expect(screen.getByText(/พร้อมส่ง: 25 ชิ้น/)).toBeDefined();
    expect(screen.getByText(/ติดจอง: 2 ชิ้น/)).toBeDefined();
    expect(screen.getByText(/\(ทั้งหมด 27\)/)).toBeDefined();

    // Simulate select change
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "SKU-001" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [selectedCode, augmentedData] = onChange.mock.calls[0];
    expect(selectedCode).toBe("SKU-001");
    expect(augmentedData.availableStock).toBe(25);
    expect(augmentedData.reservedStock).toBe(2);
    expect(augmentedData.stockQuantity).toBe(27);
  });

  it("displays and selects Inventory Formulas when includeFormulas is true", () => {
    vi.spyOn(skuQueries, "useSKUListQuery").mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            sku: "CHICKEN",
            name: "ไก่",
            category: "Raw Material",
            price: 50,
            cost: 20,
            isBundle: false,
            status: "active",
          },
          {
            id: 2,
            sku: "FISH",
            name: "ปลา",
            category: "Raw Material",
            price: 40,
            cost: 15,
            isBundle: false,
            status: "active",
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(stockQueries, "useStockBySKU").mockReturnValue({
      stockMap: new Map(),
      getStockForSKU: () => undefined,
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    // Mock Inventory Formulas (CHICKEN 50x1 + FISH 40x2 = 130 บาทต่อชุด)
    vi.spyOn(inventoryQueries, "useInventoryFormulasQuery").mockReturnValue({
      data: [
        {
          id: 99,
          code: "FORMULA-SET-1",
          name: "ชุดเครื่องนอนพรีเมียม",
          isActive: true,
          availableSets: 14,
          items: [
            { componentSku: "CHICKEN", qty: 1, unit: "piece" },
            { componentSku: "FISH", qty: 2, unit: "piece" },
          ],
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    const onChange = vi.fn();
    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <SKUSelect
          value="FORMULA-SET-1"
          onChange={onChange}
          includeFormulas={true}
        />
      </QueryClientProvider>
    );

    // Should show formula in dropdown option with derived selling price (50x1 + 40x2 = 130)
    expect(screen.getByText(/\[ชุด Inventory\] FORMULA-SET-1/)).toBeDefined();
    expect(screen.getByText(/— ฿130\.00 \(พร้อมส่ง 14 ชุด\)/)).toBeDefined();

    // Should show formula chip with derived price
    expect(screen.getByText(/ชุดสินค้า Inventory \(เสมือน\)/)).toBeDefined();
    expect(screen.getByText(/พร้อมประกอบส่ง: 14 ชุด/)).toBeDefined();
    expect(screen.getByText(/ราคาชุด:/)).toBeDefined();
    expect(screen.getByText(/^฿130\.00$/)).toBeDefined();

    // Simulate change
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "FORMULA-SET-1" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const [selectedCode, formulaData] = onChange.mock.calls[0];
    expect(selectedCode).toBe("FORMULA-SET-1");
    expect(formulaData.isFormula).toBe(true);
    expect(formulaData.availableStock).toBe(14);
    // Derived price must travel with onChange so the order line is priced correctly
    expect(formulaData.price).toBe(130);
  });

  it("shows Inventory set price derived from component retail prices in inventoryOnly mode", () => {
    vi.spyOn(skuQueries, "useSKUListQuery").mockReturnValue({
      data: {
        data: [
          {
            id: 1,
            sku: "SKU-REGULAR",
            name: "สินค้า SKU ปกติ",
            price: 200,
            status: "active",
          },
          {
            id: 2,
            sku: "MAT-A",
            name: "วัตถุดิบ A",
            price: 30,
            status: "active",
          },
          {
            id: 3,
            sku: "MAT-B",
            name: "วัตถุดิบ B",
            price: 10,
            status: "active",
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(stockQueries, "useStockBySKU").mockReturnValue({
      stockMap: new Map(),
      getStockForSKU: () => undefined,
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(inventoryQueries, "useInventoryFormulasQuery").mockReturnValue({
      data: [
        {
          id: 5,
          code: "INV-ONLY-01",
          name: "ชุดสินค้า Inventory เท่านั้น",
          isActive: true,
          availableSets: 8,
          items: [
            { componentSku: "MAT-A", qty: 2, unit: "piece" },
            { componentSku: "MAT-B", qty: 3, unit: "piece" },
          ],
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    const onChange = vi.fn();
    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <SKUSelect
          value="INV-ONLY-01"
          onChange={onChange}
          inventoryOnly={true}
        />
      </QueryClientProvider>
    );

    // Should NOT show SKU master items
    expect(screen.queryByText(/SKU-REGULAR/)).toBeNull();
    expect(screen.queryByText(/สินค้าเดี่ยว & สินค้าชุด/)).toBeNull();

    // Should show ONLY Inventory items with derived price (30x2 + 10x3 = 90)
    expect(screen.getByText(/INV-ONLY-01 · ชุดสินค้า Inventory เท่านั้น/)).toBeDefined();
    expect(screen.getByText(/— ฿90\.00 \(พร้อมส่ง 8 ชุด\)/)).toBeDefined();
    expect(screen.getByText(/-- กรุณาเลือกชุดสินค้า Inventory --/)).toBeDefined();
    expect(screen.getByText("สินค้า Inventory")).toBeDefined();
  });

  it("shows ราคาขาย 0 with warning hint when Inventory set has no component prices yet", () => {
    vi.spyOn(skuQueries, "useSKUListQuery").mockReturnValue({
      data: { data: [] },
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(stockQueries, "useStockBySKU").mockReturnValue({
      stockMap: new Map(),
      getStockForSKU: () => undefined,
      data: [],
      isLoading: false,
      isError: false,
    } as any);

    vi.spyOn(inventoryQueries, "useInventoryFormulasQuery").mockReturnValue({
      data: [
        {
          id: 7,
          code: "NO-PRICE-SET",
          name: "ชุดไม่มีราคา",
          isActive: true,
          availableSets: 3,
          items: [{ componentSku: "UNKNOWN-MAT", qty: 1, unit: "piece" }],
        },
      ],
      isLoading: false,
      isError: false,
    } as any);

    const onChange = vi.fn();
    const qc = new QueryClient();

    render(
      <QueryClientProvider client={qc}>
        <SKUSelect value="NO-PRICE-SET" onChange={onChange} inventoryOnly={true} />
      </QueryClientProvider>
    );

    expect(screen.getByText(/ราคาชุด:/)).toBeDefined();
    expect(screen.getByText(/^฿0\.00$/)).toBeDefined();
    expect(screen.getByText(/คำนวณจากราคาวัตถุดิบ/)).toBeDefined();
  });
});


