"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { YearlyByType } from "@/lib/openfda";

const COLORS = {
  malfunction: "#b9d3c4",
  injury: "#a3814a",
  death: "#9a4a2e",
};

export function TrendChart({ data }: { data: YearlyByType[] }) {
  return (
    <div className="h-[420px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 12, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e9e2d4" vertical={false} />
          <XAxis
            dataKey="year"
            tick={{ fill: "#6f6757", fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: "#d8cfbe" }}
          />
          <YAxis
            tick={{ fill: "#6f6757", fontSize: 12 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
          />
          <Tooltip
            cursor={{ fill: "#f4efe6" }}
            contentStyle={{
              background: "#fbf8f3",
              border: "1px solid #d8cfbe",
              borderRadius: 8,
              fontSize: 13,
            }}
            formatter={(value, name) => [
              (value as number).toLocaleString(),
              (name as string).charAt(0).toUpperCase() + (name as string).slice(1),
            ]}
          />
          <Legend
            formatter={(value: string) =>
              value.charAt(0).toUpperCase() + value.slice(1)
            }
            wrapperStyle={{ fontSize: 13, color: "#5a5346" }}
          />
          <ReferenceLine
            x={2019}
            stroke="#8a6d3b"
            strokeDasharray="4 4"
            label={{
              value: "FDA ends Alternative Summary Reporting",
              position: "insideTopLeft",
              fill: "#8a6d3b",
              fontSize: 12,
            }}
          />
          <Bar dataKey="malfunction" stackId="a" fill={COLORS.malfunction} />
          <Bar dataKey="injury" stackId="a" fill={COLORS.injury} />
          <Bar dataKey="death" stackId="a" fill={COLORS.death} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
