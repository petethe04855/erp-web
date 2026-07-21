"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
} from "chart.js";
import { Chart } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LineController,
  BarController,
);

interface CashFlowChartProps {
  t: ReturnType<typeof useTheme>["tokens"];
  data: { d: number; rev: number; exp: number }[];
  height?: number;
}

export function CashFlowChart({
  t,
  data,
  height = 280,
}: CashFlowChartProps) {
  const c = t.color;
  const labels = data.map((d) => `Day ${d.d}`);

  const ma = data.map((_, i) => {
    const lo = Math.max(0, i - 3),
      hi = Math.min(data.length - 1, i + 3);
    let s = 0,
      n = 0;
    for (let k = lo; k <= hi; k++) {
      s += data[k].rev - data[k].exp;
      n++;
    }
    return s / n;
  });

  const chartData = {
    labels,
    datasets: [
      {
        type: "line" as const,
        label: "ค่าเฉลี่ยกำไร 7 วัน",
        borderColor: c.ink2,
        borderWidth: 1.5,
        fill: false,
        data: ma,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        type: "bar" as const,
        label: "รายรับ",
        backgroundColor: c.accent,
        data: data.map((d) => d.rev),
        borderRadius: 2,
      },
      {
        type: "bar" as const,
        label: "รายจ่าย",
        backgroundColor: c.expense,
        data: data.map((d) => d.exp),
        borderRadius: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        backgroundColor: c.surface,
        titleColor: c.ink,
        bodyColor: c.ink2,
        borderColor: c.border,
        borderWidth: 1,
        titleFont: { family: t.font.sans, size: 12, weight: "bold" as const },
        bodyFont: { family: t.font.sans, size: 12 },
        callbacks: {
          label: (context: any) => {
            let label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += new Intl.NumberFormat("th-TH", {
                style: "currency",
                currency: "THB",
                maximumFractionDigits: 0,
              }).format(context.parsed.y);
            }
            return label;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.mono, size: 10 },
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: {
          color: c.border,
          lineWidth: 0.6,
        },
        border: {
          dash: [2, 5],
        },
        ticks: {
          color: c.ink3,
          font: { family: t.font.mono, size: 10 },
          callback: (value: any) => {
            if (value >= 1_000_000)
              return `฿${(value / 1_000_000).toFixed(1)}M`;
            if (value >= 1000) return `฿${Math.round(value / 1000)}K`;
            return `฿${value}`;
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full" style={{ height }}>
      <Chart type="bar" data={chartData} options={options} />
    </div>
  );
}
