"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Copy, Check, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ApiKey = { id: string; name: string; lastUsedAt: Date | null; expiresAt: Date | null; createdAt: Date };

interface Props {
  keys: ApiKey[];
  canCreate: boolean;
}

export default function ApiKeysManager({ keys, canCreate }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState("");
  const [copied, setCopied] = useState(false);

  async function createKey() {
    if (!name) return;
    setLoading(true);
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setNewKey(json.key);
      setName("");
      router.refresh();
    }
  }

  async function deleteKey(id: string) {
    await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
    router.refresh();
  }

  async function copy() {
    await navigator.clipboard.writeText(newKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-5">
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm font-medium text-green-800 mb-2">API key created — copy it now, it won&apos;t be shown again</p>
          <div className="flex items-center gap-2 bg-white border rounded-lg p-3">
            <code className="text-xs text-gray-700 flex-1 break-all">{newKey}</code>
            <button onClick={copy} className="text-green-700 shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      )}

      {canCreate && (
        <div className="bg-white rounded-xl border p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Create API key</h2>
          <div className="flex gap-3">
            <input
              placeholder="Key name (e.g. Production)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={createKey}
              disabled={loading || !name}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border divide-y">
        {keys.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-sm">No API keys yet</p>
        ) : (
          keys.map((k) => (
            <div key={k.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{k.name}</p>
                <p className="text-xs text-gray-400">
                  Created {formatDate(k.createdAt)}
                  {k.lastUsedAt ? ` · Last used ${formatDate(k.lastUsedAt)}` : " · Never used"}
                </p>
              </div>
              {k.expiresAt && (
                <span className="text-xs text-gray-400">Expires {formatDate(k.expiresAt)}</span>
              )}
              <button onClick={() => deleteKey(k.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
