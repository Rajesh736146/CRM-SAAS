"use client";

import { useState } from "react";
import { formatDate } from "@/lib/utils";

type CompanyWithCount = {
  id: string;
  name: string;
  website: string | null;
  industry: string | null;
  size: string | null;
  createdAt: Date;
  _count: { contacts: number; deals: number };
};

interface Props {
  companies: CompanyWithCount[];
}

export default function CompaniesTable({ companies }: Props) {
  const [search, setSearch] = useState("");

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search companies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="text-left px-4 py-3 font-medium text-gray-500">Company</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Industry</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Website</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Contacts</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Deals</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No companies found</td></tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{c.name}</p>
                    {c.size && <p className="text-xs text-gray-400">{c.size} employees</p>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c.industry || "—"}</td>
                  <td className="px-4 py-3">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-xs">
                        {c.website}
                      </a>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{c._count.contacts}</td>
                  <td className="px-4 py-3 text-gray-600">{c._count.deals}</td>
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
