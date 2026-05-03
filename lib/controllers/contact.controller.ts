import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { checkLimit } from "@/lib/entitlements";
import { ContactService } from "@/lib/services/contact.service";

const createSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  title: z.string().optional(),
  status: z.enum(["LEAD", "PROSPECT", "CUSTOMER", "CHURNED"]).optional(),
  companyId: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const ContactController = {
  async getAll(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "contacts.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const contacts = await ContactService.findAll(ctx.orgId);
    return NextResponse.json(contacts);
  },

  async getOne(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "contacts.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const contact = await ContactService.findById(id, ctx.orgId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  },

  async create(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "contacts.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { allowed, limit, current } = await checkLimit(ctx.orgId, "contacts");
    if (!allowed) {
      return NextResponse.json({ error: `Contact limit reached (${current}/${limit}). Upgrade your plan.` }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const contact = await ContactService.create(parsed.data, ctx.orgId, ctx.userId);
    return NextResponse.json(contact, { status: 201 });
  },

  async update(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "contacts.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

    const contact = await ContactService.update(id, ctx.orgId, parsed.data, ctx.userId);
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  },

  async remove(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "contacts.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await ContactService.delete(id, ctx.orgId, ctx.userId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
