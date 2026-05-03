import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "settings.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const key = await prisma.apiKey.findFirst({ where: { id: params.id, organizationId: ctx.orgId } });
  if (!key) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.apiKey.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
