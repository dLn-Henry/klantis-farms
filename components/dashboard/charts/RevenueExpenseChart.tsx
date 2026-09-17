"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MonthlyFinance } from "@/lib/data/mock/analytics-trends";
import { formatCurrency } from "@/lib/utils";

export function RevenueExpenseChart({ data }: { data: MonthlyFinance[] }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE4DE" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={{ stroke: "#DCE4DE" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number) => formatCurrency(value)}
          contentStyle={{ borderRadius: 8, border: "1px solid #DCE4DE", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#1F6B45" strokeWidth={2.5} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#D99A2B" strokeWidth={2.5} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
