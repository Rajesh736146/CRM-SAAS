import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { ActivityService } from "@/lib/services/activity.service";

const createSchema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "TASK", "NOTE"]),
  title: z.string().min(1),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  contactId: z.string().optional(),
  companyId: z.string().optional(),
  dealId: z.string().optional(),
});

const updateSchema = createSchema.partial().extend({
  completed: z.boolean().optional(),
});

export const ActivityController = {
  async getAll(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "activities.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const activities = await ActivityService.findAll(ctx.orgId);
    return NextResponse.json(activities);
  },

  async getOne(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const activity = await ActivityService.findById(id, ctx.orgId);
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(activity);
  },

  async create(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "activities.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const activity = await ActivityService.create(parsed.data, ctx.userId);
    return NextResponse.json(activity, { status: 201 });
  },

  async update(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const activity = await ActivityService.update(id, ctx.orgId, parsed.data);
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(activity);
  },

  async remove(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const deleted = await ActivityService.delete(id, ctx.orgId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
