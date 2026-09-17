"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";

type BarDatum = { label: string; value: number };

export function SimpleBarChart({
  data,
  color = "#1F6B45",
  valueType = "number",
}: {
  data: BarDatum[];
  color?: string;
  valueType?: "number" | "currency";
}) {
  const format = (v: number) => (valueType === "currency" ? formatCurrency(v) : String(v));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#DCE4DE" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#66736B" }} axisLine={{ stroke: "#DCE4DE" }} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "#66736B" }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(value: number) => format(value)}
          contentStyle={{ borderRadius: 8, border: "1px solid #DCE4DE", fontSize: 12 }}
        />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
