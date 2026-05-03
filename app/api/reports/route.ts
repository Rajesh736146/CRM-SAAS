import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const type = url.searchParams.get("type") ?? "overview";
  const orgId = ctx.orgId;

  if (type === "overview") {
    const [totalContacts, totalDeals, totalCompanies, deals, activityCount] = await Promise.all([
      prisma.contact.count({ where: { organizationId: orgId } }),
      prisma.deal.count({ where: { organizationId: orgId } }),
      prisma.company.count({ where: { organizationId: orgId } }),
      prisma.deal.findMany({
        where: { organizationId: orgId },
        select: { value: true, stageId: true },
      }),
      prisma.activity.count({ where: { user: { organizationId: orgId } } }),
    ]);

    const totalRevenue = deals.reduce(
      (sum: number, d: { value: number | null; stageId: string | null }) =>
        sum + (d.value ?? 0),
      0
    );
    const wonDealsCount = deals.filter(
      (d: { stageId: string | null }) => d.stageId !== null
    ).length;

    return NextResponse.json({
      totalContacts,
      totalDeals,
      totalCompanies,
      totalRevenue,
      wonDealsCount,
      activities: activityCount,
    });
  }

  if (type === "pipeline") {
    type StageWithDeals = {
      id: string;
      name: string;
      color: string;
      deals: { id: string; value: number | null }[];
    };
    type PipelineWithStages = {
      id: string;
      name: string;
      stages: StageWithDeals[];
    };

    const pipelines: PipelineWithStages[] = await prisma.pipeline.findMany({
      where: { organizationId: orgId },
      include: {
        stages: {
          include: {
            deals: { select: { id: true, value: true } },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    const data = pipelines.map((p) => ({
      id: p.id,
      name: p.name,
      stages: p.stages.map((s) => ({
        id: s.id,
        name: s.name,
        color: s.color,
        count: s.deals.length,
        value: s.deals.reduce((sum: number, d) => sum + (d.value ?? 0), 0),
      })),
    }));

    return NextResponse.json(data);
  }

  if (type === "activity") {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activities = await prisma.activity.groupBy({
      by: ["type"],
      where: { user: { organizationId: orgId }, createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    });
    return NextResponse.json(activities);
  }

  if (type === "contacts_by_status") {
    const data = await prisma.contact.groupBy({
      by: ["status"],
      where: { organizationId: orgId },
      _count: { id: true },
    });
    return NextResponse.json(data);
  }

  return NextResponse.json({ error: "Unknown report type" }, { status: 400 });
}
