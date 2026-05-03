import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Users, TrendingUp, Coins, Target } from "lucide-react";
import RecentActivity from "@/components/dashboard/recent-activity";
import DealsByStage from "@/components/dashboard/deals-by-stage";

export default async function DashboardPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const [totalContacts, totalDeals, activities, deals] = await Promise.all([
    prisma.contact.count({ where: { organizationId: orgId } }),
    prisma.deal.count({ where: { organizationId: orgId } }),
    prisma.activity.findMany({
      where: { user: { organizationId: orgId } },
      include: { contact: true, deal: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.deal.findMany({
      where: { organizationId: orgId },
      select: {
        value: true,
        stage: { select: { name: true } },
      },
    }),
  ]);

  const totalRevenue = deals
    .filter((d) => d.stage?.name?.toLowerCase() === "won")
    .reduce((sum: number, d) => sum + (d.value ?? 0), 0);

  const openDeals = deals.filter(
    (d) => !["won", "lost"].includes(d.stage?.name?.toLowerCase() ?? "")
  ).length;

  const stats = [
    { label: "Total Contacts", value: totalContacts, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Total Deals", value: totalDeals, icon: Target, color: "bg-purple-50 text-purple-600" },
    { label: "Open Deals", value: openDeals, icon: TrendingUp, color: "bg-orange-50 text-orange-600" },
    { label: "Revenue Won", value: formatCurrency(totalRevenue), icon: Coins, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, {session?.user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DealsByStage deals={deals} />
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
