"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SentimentBreakdown } from "@/lib/types";

interface SentimentChartProps {
  breakdown: SentimentBreakdown;
}

const COLORS = {
  positive: "#4dff91",
  negative: "#ff4d4d",
  neutral: "#a3a3a3",
};

export default function SentimentChart({ breakdown }: SentimentChartProps) {
  const data = [
    { name: "Positive", value: breakdown.positive, color: COLORS.positive },
    { name: "Negative", value: breakdown.negative, color: COLORS.negative },
    { name: "Neutral", value: breakdown.neutral, color: COLORS.neutral },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f1f1f] border border-[#262626] rounded-lg px-3 py-2">
          <p className="text-sm">
            <span style={{ color: payload[0].payload.color }} className="font-semibold">
              {payload[0].name}
            </span>
            : {payload[0].value}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            strokeWidth={0}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-sm text-[#a3a3a3]">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
