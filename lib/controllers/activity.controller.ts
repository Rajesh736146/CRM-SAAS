import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
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

async function getSession() {
  const session = await auth();
  if (!session) return null;
  return session;
}

export const ActivityController = {
  async getAll() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = (session.user as any)?.organizationId;
    const activities = await ActivityService.findAll(orgId);
    return NextResponse.json(activities);
  },

  async getOne(id: string) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = (session.user as any)?.organizationId;
    const activity = await ActivityService.findById(id, orgId);
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(activity);
  },

  async create(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const activity = await ActivityService.create(parsed.data, session.user!.id!);
    return NextResponse.json(activity, { status: 201 });
  },

  async update(req: Request, id: string) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = (session.user as any)?.organizationId;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const activity = await ActivityService.update(id, orgId, parsed.data);
    if (!activity) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(activity);
  },

  async remove(id: string) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const orgId = (session.user as any)?.organizationId;
    const deleted = await ActivityService.delete(id, orgId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
