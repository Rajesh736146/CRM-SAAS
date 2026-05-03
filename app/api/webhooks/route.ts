import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { canUseFeature } from "@/lib/entitlements";
import { WebhookService } from "@/lib/services/webhook.service";

const AVAILABLE_EVENTS = [
  "contact.created", "contact.updated", "contact.deleted",
  "deal.created", "deal.updated", "deal.stage_changed", "deal.deleted",
  "company.created", "company.updated", "company.deleted",
];

const createSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()).min(1),
});

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const webhooks = await WebhookService.findAll(ctx.orgId);
  // Never expose the secret
  return NextResponse.json(webhooks.map(({ secret: _, ...w }) => w));
}

export async function POST(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "webhooks.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allowed = await canUseFeature(ctx.orgId, "webhooks");
  if (!allowed) return NextResponse.json({ error: "Webhooks require PRO plan or higher" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const webhook = await WebhookService.create(ctx.orgId, parsed.data);
  const { secret: _, ...safe } = webhook;
  return NextResponse.json(safe, { status: 201 });
}
