"use client";

import { formatCurrency } from "@/lib/utils";

const STAGES = [
  { key: "PROSPECTING", label: "Prospecting", color: "bg-gray-400" },
  { key: "QUALIFICATION", label: "Qualification", color: "bg-blue-400" },
  { key: "PROPOSAL", label: "Proposal", color: "bg-yellow-400" },
  { key: "NEGOTIATION", label: "Negotiation", color: "bg-orange-400" },
  { key: "CLOSED_WON", label: "Closed Won", color: "bg-green-500" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "bg-red-400" },
];

interface Props {
  deals: { stage: string; value: number | null }[];
}

export default function DealsByStage({ deals }: Props) {
  const byStage = STAGES.map((s) => {
    const stageDeal = deals.filter((d) => d.stage === s.key);
    return {
      ...s,
      count: stageDeal.length,
      value: stageDeal.reduce((sum, d) => sum + (d.value ?? 0), 0),
    };
  });

  return (
    <div className="bg-white rounded-xl border p-5">
      <h2 className="font-semibold text-gray-900 mb-4">Deals by Stage</h2>
      <div className="space-y-3">
        {byStage.map((s) => (
          <div key={s.key} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${s.color}`} />
            <span className="text-sm text-gray-600 w-32">{s.label}</span>
            <div className="flex-1 bg-gray-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${s.color}`}
                style={{ width: `${deals.length ? (s.count / deals.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-sm text-gray-500 w-8 text-right">{s.count}</span>
            <span className="text-sm font-medium text-gray-700 w-20 text-right">{formatCurrency(s.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
