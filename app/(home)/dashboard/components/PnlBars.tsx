"use client";

import { useTheme } from "@/lib/design/ThemeContext";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

interface PnlBarsProps {
  t: ReturnType<typeof useTheme>["tokens"];
  data: { month: string; rev: number; net: number }[];
}

export function PnlBars({
  t,
  data,
}: PnlBarsProps) {
  const c = t.color;
  const labels = data.map((d) => d.month);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Revenue",
        backgroundColor: c.subtle,
        borderColor: c.border,
        borderWidth: 1,
        borderRadius: 2,
        data: data.map((d) => d.rev),
      },
      {
        label: "Net profit",
        backgroundColor: c.accent,
        borderRadius: 2,
        data: data.map((d) => d.net),
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
        titleFont: { family: t.font.sans, size: 11, weight: "bold" as const },
        bodyFont: { family: t.font.sans, size: 11 },
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
          font: { family: t.font.sans, size: 11 },
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
    <div className="relative h-[140px] mt-2.5">
      <Bar data={chartData} options={options} />
    </div>
  );
}
