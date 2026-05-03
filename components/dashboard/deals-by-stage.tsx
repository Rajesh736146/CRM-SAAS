"use client";

import { formatCurrency } from "@/lib/utils";

type Deal = {
  value: number | null;
  stage: { name: string } | null;
};

interface Props {
  deals: Deal[];
}

export default function DealsByStage({ deals }: Props) {
  // Group by stage name dynamically
  const stageMap = new Map<string, { count: number; value: number }>();

  for (const deal of deals) {
    const name = deal.stage?.name ?? "No Stage";
    const existing = stageMap.get(name) ?? { count: 0, value: 0 };
    stageMap.set(name, {
      count: existing.count + 1,
      value: existing.value + (deal.value ?? 0),
    });
  }

  const stages = Array.from(stageMap.entries()).map(([name, data]) => ({
    name,
    ...data,
  }));

  const COLORS = [
    "bg-gray-400", "bg-blue-400", "bg-yellow-400",
    "bg-orange-400", "bg-green-500", "bg-red-400",
    "bg-purple-400", "bg-pink-400",
  ];

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Deals by Stage</h2>
      {stages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No deals yet</p>
      ) : (
        <div className="space-y-3">
          {stages.map((s, i) => (
            <div key={s.name} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${COLORS[i % COLORS.length]}`} />
              <span className="text-sm text-gray-600 w-32 truncate">{s.name}</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${COLORS[i % COLORS.length]}`}
                  style={{ width: `${deals.length ? (s.count / deals.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-sm text-gray-500 w-8 text-right">{s.count}</span>
              <span className="text-sm font-medium text-gray-700 w-20 text-right">{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
