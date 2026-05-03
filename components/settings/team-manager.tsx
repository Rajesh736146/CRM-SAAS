"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Mail, Copy, Check } from "lucide-react";
import { formatDate } from "@/lib/utils";

type Member = { id: string; name: string | null; email: string; role: string; createdAt: Date };
type Invitation = { id: string; email: string; role: string; token: string; expiresAt: Date };

interface Props {
  members: Member[];
  invitations: Invitation[];
  currentUserId: string;
}

export default function TeamManager({ members, invitations, currentUserId }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  async function sendInvite() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/team/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const json = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(json.error ?? "Failed to send invite");
    } else {
      setInviteUrl(json.inviteUrl);
      setEmail("");
      router.refresh();
    }
  }

  async function copyUrl() {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const ROLE_COLORS: Record<string, string> = {
    OWNER: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    MEMBER: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Invite member</h2>
        <div className="flex gap-3">
          <input
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")}
            className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
          <button
            onClick={sendInvite}
            disabled={loading || !email}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            {loading ? "Sending..." : "Invite"}
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        {inviteUrl && (
          <div className="mt-3 flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-700 flex-1 truncate">{inviteUrl}</p>
            <button onClick={copyUrl} className="text-green-700 hover:text-green-900">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border divide-y">
        <div className="px-5 py-3 bg-gray-50 rounded-t-xl">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Members</p>
        </div>
        {members.map((m) => (
          <div key={m.id} className="flex items-center gap-3 px-5 py-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
              {(m.name ?? m.email)[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{m.name ?? "—"}</p>
              <p className="text-xs text-gray-400">{m.email}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>{m.role}</span>
            <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
          </div>
        ))}
      </div>

      {invitations.length > 0 && (
        <div className="bg-white rounded-xl border divide-y">
          <div className="px-5 py-3 bg-gray-50 rounded-t-xl">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Pending Invitations</p>
          </div>
          {invitations.map((inv) => (
            <div key={inv.id} className="flex items-center gap-3 px-5 py-4">
              <div className="p-2 bg-gray-50 rounded-lg"><Mail className="w-4 h-4 text-gray-400" /></div>
              <div className="flex-1">
                <p className="text-sm text-gray-700">{inv.email}</p>
                <p className="text-xs text-gray-400">Expires {formatDate(inv.expiresAt)}</p>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${ROLE_COLORS[inv.role]}`}>{inv.role}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
