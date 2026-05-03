import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ActivitiesList from "@/components/activities/activities-list";
import NewActivityButton from "@/components/activities/new-activity-button";

export const dynamic = "force-dynamic";

export default async function ActivitiesPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const activities = await prisma.activity.findMany({
    where: { user: { organizationId: orgId } },
    include: { contact: true, deal: true, user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Activities</h1>
          <p className="text-gray-500 text-sm mt-1">{activities.length} activities</p>
        </div>
        <NewActivityButton />
      </div>
      <ActivitiesList activities={activities} />
    </div>
  );
}
