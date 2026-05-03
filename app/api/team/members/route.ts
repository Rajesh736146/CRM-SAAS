import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "team.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const members = await prisma.user.findMany({
    where: { organizationId: ctx.orgId },
    select: { id: true, name: true, email: true, role: true, createdAt: true, image: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(members);
}
