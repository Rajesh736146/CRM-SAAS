"use client";

import { useState } from "react";
import { formatDate, getInitials } from "@/lib/utils";

type ContactWithCompany = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  status: string;
  createdAt: Date;
  company: { id: string; name: string } | null;
};

const STATUS_COLORS: Record<string, string> = {
  LEAD: "bg-gray-100 text-gray-700",
  PROSPECT: "bg-blue-100 text-blue-700",
  CUSTOMER: "bg-green-100 text-green-700",
  CHURNED: "bg-red-100 text-red-700",
};

interface Props {
  contacts: ContactWithCompany[];
}

export default function ContactsTable({ contacts }: Props) {
  const [search, setSearch] = useState("");

  const filtered = contacts.filter((c) =>
    `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search contacts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">No contacts found</td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold">
                        {getInitials(`${c.firstName} ${c.lastName}`)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{c.firstName} {c.lastName}</p>
                        {c.title && <p className="text-xs text-gray-400">{c.title}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.email || "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{c.company?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{formatDate(c.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
