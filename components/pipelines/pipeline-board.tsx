"use client";

import { formatCurrency } from "@/lib/utils";
import Link from "next/link";

type Stage = { id: string; name: string; color: string; order: number };
type Pipeline = {
  id: string;
  name: string;
  stages: Stage[];
  _count: { deals: number };
};

interface Props {
  pipelines: Pipeline[];
}

export default function PipelineBoard({ pipelines }: Props) {
  if (pipelines.length === 0) {
    return (
      <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
        No pipelines yet. Create one to get started.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {pipelines.map((p) => (
        <div key={p.id} className="bg-white rounded-xl border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">{p.name}</h2>
              <p className="text-xs text-gray-400">{p._count.deals} deals</p>
            </div>
            <Link
              href={`/pipelines/${p.id}`}
              className="text-xs text-blue-600 hover:underline"
            >
              View board →
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {p.stages.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 flex-1">
                <div className="flex-1">
                  <div className="h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <p className="text-xs text-gray-500 mt-1 truncate">{s.name}</p>
                </div>
                {i < p.stages.length - 1 && <div className="text-gray-300 text-xs">→</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
