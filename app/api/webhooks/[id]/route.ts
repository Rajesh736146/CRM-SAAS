import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { WebhookService } from "@/lib/services/webhook.service";

export const dynamic = "force-dynamic";

const updateSchema = z.object({
  url: z.string().url().optional(),
  events: z.array(z.string()).optional(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "webhooks.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const webhook = await WebhookService.update(params.id, ctx.orgId, parsed.data);
  if (!webhook) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { secret: _, ...safe } = webhook;
  return NextResponse.json(safe);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "webhooks.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const deleted = await WebhookService.delete(params.id, ctx.orgId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
