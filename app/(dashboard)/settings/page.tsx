import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Users, Key, Webhook, Shield, Building2 } from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;
  const role = (session?.user as any)?.role;

  const org = await prisma.organization.findUnique({
    where: { id: orgId },
    include: { _count: { select: { users: true } } },
  });

  const sections = [
    { href: "/settings/team", label: "Team Members", description: "Manage members and send invitations", icon: Users, roles: ["OWNER", "ADMIN"] },
    { href: "/settings/api-keys", label: "API Keys", description: "Generate keys for programmatic access", icon: Key, roles: ["OWNER"] },
    { href: "/settings/webhooks", label: "Webhooks", description: "Subscribe to CRM events", icon: Webhook, roles: ["OWNER", "ADMIN"] },
    { href: "/settings/audit-log", label: "Audit Log", description: "Track all changes in your organization", icon: Shield, roles: ["OWNER", "ADMIN"] },
  ].filter((s) => s.roles.includes(role));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your organization and account</p>
      </div>

      <div className="bg-white rounded-xl border p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg"><Building2 className="w-5 h-5 text-blue-600" /></div>
          <div>
            <h2 className="font-semibold text-gray-900">{org?.name}</h2>
            <p className="text-xs text-gray-400">{org?.slug}</p>
          </div>
          <span className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium ${
            org?.plan === "ENTERPRISE" ? "bg-purple-100 text-purple-700" :
            org?.plan === "PRO" ? "bg-blue-100 text-blue-700" :
            "bg-gray-100 text-gray-600"
          }`}>{org?.plan}</span>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
          <div>
            <p className="text-xs text-gray-400">Members</p>
            <p className="text-sm font-medium text-gray-900">{org?._count.users} / {org?.seats === -1 ? "∞" : org?.seats}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">Your role</p>
            <p className="text-sm font-medium text-gray-900">{role}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link key={s.href} href={s.href} className="bg-white rounded-xl border p-5 hover:border-blue-300 hover:shadow-sm transition-all group">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                <s.icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
