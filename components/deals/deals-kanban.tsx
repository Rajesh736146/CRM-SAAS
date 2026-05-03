"use client";

import { formatCurrency } from "@/lib/utils";

type DealWithRelations = {
  id: string;
  title: string;
  value: number | null;
  stage: string;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
};

const STAGES = [
  { key: "PROSPECTING", label: "Prospecting", color: "border-t-gray-400" },
  { key: "QUALIFICATION", label: "Qualification", color: "border-t-blue-400" },
  { key: "PROPOSAL", label: "Proposal", color: "border-t-yellow-400" },
  { key: "NEGOTIATION", label: "Negotiation", color: "border-t-orange-400" },
  { key: "CLOSED_WON", label: "Closed Won", color: "border-t-green-500" },
  { key: "CLOSED_LOST", label: "Closed Lost", color: "border-t-red-400" },
];

interface Props {
  deals: DealWithRelations[];
}

export default function DealsKanban({ deals }: Props) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STAGES.map((stage) => {
        const stageDeals = deals.filter((d) => d.stage === stage.key);
        const total = stageDeals.reduce((sum, d) => sum + (d.value ?? 0), 0);

        return (
          <div key={stage.key} className="flex-shrink-0 w-64">
            <div className={`bg-white rounded-xl border border-t-4 ${stage.color}`}>
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{stage.label}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                </div>
                {total > 0 && <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(total)}</p>}
              </div>
              <div className="p-2 space-y-2 min-h-24">
                {stageDeals.map((deal) => (
                  <div key={deal.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-800 truncate">{deal.title}</p>
                    {deal.value && <p className="text-xs text-green-600 font-medium mt-1">{formatCurrency(deal.value)}</p>}
                    {deal.contact && (
                      <p className="text-xs text-gray-400 mt-1">{deal.contact.firstName} {deal.contact.lastName}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
