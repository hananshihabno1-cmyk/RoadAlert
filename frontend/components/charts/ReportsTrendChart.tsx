"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RoadReport } from "@/lib/types";

export default function ReportsTrendChart({ reports }: { reports: RoadReport[] }) {
  // Group by date (YYYY-MM-DD)
  const dateCounts: Record<string, number> = {};
  
  reports.forEach((r) => {
    const d = new Date(r.created_at);
    // basic local date string (e.g. "Aug 1")
    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    dateCounts[dateStr] = (dateCounts[dateStr] || 0) + 1;
  });

  const data = Object.entries(dateCounts).map(([date, count]) => ({ date, count }));
  
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
          <XAxis 
            dataKey="date" 
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
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#F5B700"
            strokeWidth={2}
            dot={{ r: 4, fill: "#F5B700", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
