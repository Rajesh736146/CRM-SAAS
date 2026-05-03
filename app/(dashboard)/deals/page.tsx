import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import DealsKanban from "@/components/deals/deals-kanban";
import NewDealButton from "@/components/deals/new-deal-button";

export const dynamic = "force-dynamic";

export default async function DealsPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const deals = await prisma.deal.findMany({
    where: { organizationId: orgId },
    include: { contact: true, company: true, stage: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 text-sm mt-1">{deals.length} deals</p>
        </div>
        <NewDealButton />
      </div>
      <DealsKanban deals={deals} />
    </div>
  );
}
