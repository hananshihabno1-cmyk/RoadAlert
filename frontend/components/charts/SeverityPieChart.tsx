"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { RoadReport } from "@/lib/types";

const SEVERITY_COLORS: Record<string, string> = {
  high: "#FF4545",
  medium: "#F5B700",
  low: "#3DDC84",
};

export default function SeverityPieChart({ reports }: { reports: RoadReport[] }) {
  const data = [
    { name: "High", value: reports.filter((r) => r.severity === "high").length, fill: SEVERITY_COLORS.high },
    { name: "Medium", value: reports.filter((r) => r.severity === "medium").length, fill: SEVERITY_COLORS.medium },
    { name: "Low", value: reports.filter((r) => r.severity === "low").length, fill: SEVERITY_COLORS.low },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#333", color: "#fff", borderRadius: "8px" }}
            itemStyle={{ color: "#fff" }}
          />
          <Legend wrapperStyle={{ fontSize: "12px", fontFamily: "monospace" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
