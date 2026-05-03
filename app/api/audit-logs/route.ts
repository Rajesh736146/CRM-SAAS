import { NextResponse } from "next/server";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { AuditService } from "@/lib/services/audit.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "audit_log.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get("limit") ?? "50");
  const logs = await AuditService.findAll(ctx.orgId, Math.min(limit, 200));
  return NextResponse.json(logs);
}
