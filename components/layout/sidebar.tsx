"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Building2, TrendingUp,
  Activity, Settings, GitBranch, ChevronDown, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contacts", label: "Contacts", icon: Users },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/deals", label: "Deals", icon: TrendingUp },
  { href: "/pipelines", label: "Pipelines", icon: GitBranch },
  { href: "/activities", label: "Activities", icon: Activity },
];

const settingsNav = [
  { href: "/settings", label: "Overview" },
  { href: "/settings/team", label: "Team" },
  { href: "/settings/webhooks", label: "Webhooks" },
  { href: "/settings/api-keys", label: "API Keys" },
  { href: "/settings/audit-log", label: "Audit Log" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const inSettings = pathname.startsWith("/settings");
  const [settingsOpen, setSettingsOpen] = useState(inSettings);

  return (
    <aside className="w-60 bg-white border-r flex flex-col">
      <div className="p-6 border-b">
        <span className="text-xl font-bold text-blue-600">CRM</span>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </Link>
        ))}

        {/* Settings collapsible */}
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            inSettings ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-100"
          )}
        >
          <Settings className="w-4 h-4" />
          <span className="flex-1 text-left">Settings</span>
          {settingsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {settingsOpen && (
          <div className="ml-7 space-y-0.5">
            {settingsNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "block px-3 py-1.5 rounded-lg text-sm transition-colors",
                  pathname === href ? "text-blue-700 font-medium" : "text-gray-500 hover:text-gray-800"
                )}
              >
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
