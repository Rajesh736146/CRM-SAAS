"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ALL_EVENTS = [
  "contact.created", "contact.updated", "contact.deleted",
  "deal.created", "deal.updated", "deal.stage_changed", "deal.deleted",
  "company.created", "company.updated", "company.deleted",
];

type Webhook = { id: string; url: string; events: string[]; active: boolean; createdAt: Date };

interface Props {
  webhooks: Webhook[];
  canCreate: boolean;
}

export default function WebhooksManager({ webhooks, canCreate }: Props) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["contact.created", "deal.created"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleEvent(e: string) {
    setEvents((prev) => prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]);
  }

  async function create() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, events }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to create webhook");
    } else {
      setUrl("");
      router.refresh();
    }
  }

  async function toggle(id: string, active: boolean) {
    await fetch(`/api/webhooks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !active }),
    });
    router.refresh();
  }

  async function remove(id: string) {
    await fetch(`/api/webhooks/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {canCreate && (
        <div className="bg-white rounded-xl border p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Add webhook</h2>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Endpoint URL</label>
            <input
              placeholder="https://your-server.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Events to subscribe</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_EVENTS.map((e) => (
                <label key={e} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={events.includes(e)}
                    onChange={() => toggleEvent(e)}
                    className="rounded"
                  />
                  <span className="text-xs text-gray-600">{e}</span>
                </label>
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            onClick={create}
            disabled={loading || !url || events.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            {loading ? "Creating..." : "Add webhook"}
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border divide-y">
        {webhooks.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No webhooks configured</p>
        ) : (
          webhooks.map((w) => (
            <div key={w.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{w.url}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Added {formatDate(w.createdAt)}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {w.events.map((e) => (
                      <span key={e} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => toggle(w.id, w.active)} className="text-gray-400 hover:text-blue-600 transition-colors">
                    {w.active ? <ToggleRight className="w-5 h-5 text-blue-600" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => remove(w.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
