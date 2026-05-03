"use client";

import { formatCurrency } from "@/lib/utils";

type DealWithRelations = {
  id: string;
  title: string;
  value: number | null;
  stageId: string | null;
  stage: { id: string; name: string; color: string } | null;
  contact: { id: string; firstName: string; lastName: string } | null;
  company: { id: string; name: string } | null;
};

interface Props {
  deals: DealWithRelations[];
}

export default function DealsKanban({ deals }: Props) {
  // Build columns dynamically from the stage relation
  const stageMap = new Map<string, { id: string; name: string; color: string; deals: DealWithRelations[] }>();

  // Collect unique stages preserving order of first appearance
  for (const deal of deals) {
    const stageId = deal.stageId ?? "__none__";
    if (!stageMap.has(stageId)) {
      stageMap.set(stageId, {
        id: stageId,
        name: deal.stage?.name ?? "No Stage",
        color: deal.stage?.color ?? "#94a3b8",
        deals: [],
      });
    }
    stageMap.get(stageId)!.deals.push(deal);
  }

  // Add an empty "No Stage" column if there are unassigned deals
  const columns = Array.from(stageMap.values());

  if (columns.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
        No deals yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const total = col.deals.reduce((sum: number, d) => sum + (d.value ?? 0), 0);

        return (
          <div key={col.id} className="flex-shrink-0 w-64">
            <div className="bg-white rounded-xl border border-t-4" style={{ borderTopColor: col.color }}>
              <div className="p-3 border-b">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{col.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{col.deals.length}</span>
                </div>
                {total > 0 && <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(total)}</p>}
              </div>
              <div className="p-2 space-y-2 min-h-24">
                {col.deals.map((deal) => (
                  <div key={deal.id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors cursor-pointer">
                    <p className="text-sm font-medium text-gray-800 truncate">{deal.title}</p>
                    {deal.value && (
                      <p className="text-xs font-medium mt-1" style={{ color: col.color }}>
                        {formatCurrency(deal.value)}
                      </p>
                    )}
                    {deal.contact && (
                      <p className="text-xs text-gray-400 mt-1">
                        {deal.contact.firstName} {deal.contact.lastName}
                      </p>
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
