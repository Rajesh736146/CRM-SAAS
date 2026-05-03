import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TeamManager from "@/components/settings/team-manager";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const [members, invitations] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invitation.findMany({
      where: { organizationId: orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
        <p className="text-gray-500 text-sm mt-1">{members.length} members in your organization</p>
      </div>
      <TeamManager members={members} invitations={invitations} currentUserId={session?.user?.id!} />
    </div>
  );
}
