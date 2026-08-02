"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { RoadReport } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#F5B700",
  in_review: "#3B82F6", // blue
  repairing: "#8B5CF6", // purple
  completed: "#3DDC84", // green
};

export default function StatusBarChart({ reports }: { reports: RoadReport[] }) {
  const counts = {
    pending: 0,
    in_review: 0,
    repairing: 0,
    completed: 0,
  };

  reports.forEach((r) => {
    if (counts[r.status] !== undefined) {
      counts[r.status]++;
    }
  });

  const data = [
    { name: "Pending", value: counts.pending, fill: STATUS_COLORS.pending },
    { name: "In Review", value: counts.in_review, fill: STATUS_COLORS.in_review },
    { name: "Repairing", value: counts.repairing, fill: STATUS_COLORS.repairing },
    { name: "Completed", value: counts.completed, fill: STATUS_COLORS.completed },
  ].filter(d => d.value > 0 || d.name === "Pending" || d.name === "Completed");

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#888" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
            dy={10} 
          />
          <YAxis 
            stroke="#888" 
            fontSize={11} 
            tickLine={false} 
            axisLine={false} 
          />
          <Tooltip
            contentStyle={{ backgroundColor: "#1e1e24", borderColor: "#333", color: "#fff", borderRadius: "8px" }}
            cursor={{ fill: "#333", opacity: 0.4 }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
