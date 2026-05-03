import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { checkLimit } from "@/lib/entitlements";
import { DealService } from "@/lib/services/deal.service";

const createSchema = z.object({
  title: z.string().min(1),
  value: z.number().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  closeDate: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const DealController = {
  async getAll(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "deals.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const deals = await DealService.findAll(ctx.orgId);
    return NextResponse.json(deals);
  },

  async getOne(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "deals.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const deal = await DealService.findById(id, ctx.orgId);
    if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(deal);
  },

  async create(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "deals.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { allowed, limit, current } = await checkLimit(ctx.orgId, "deals");
    if (!allowed) {
      return NextResponse.json({ error: `Deal limit reached (${current}/${limit}). Upgrade your plan.` }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const deal = await DealService.create(parsed.data, ctx.orgId, ctx.userId);
    return NextResponse.json(deal, { status: 201 });
  },

  async update(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "deals.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const deal = await DealService.update(id, ctx.orgId, parsed.data, ctx.userId);
    if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(deal);
  },

  async remove(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "deals.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await DealService.delete(id, ctx.orgId, ctx.userId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
