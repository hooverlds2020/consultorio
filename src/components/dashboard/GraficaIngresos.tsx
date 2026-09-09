"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function GraficaIngresos({ serie }: { serie: { fecha: string; total: number }[] }) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-4 md:p-5">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Ingresos — últimos 7 días</h3>
      <div className="h-48 md:h-56 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: "#6b7280" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
              width={40}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toLocaleString("es-MX")}`, "Ingresos"]}
              contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
            />
            <Area type="monotone" dataKey="total" stroke="#16a34a" strokeWidth={2} fill="url(#colorIngresos)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
