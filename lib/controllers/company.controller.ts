import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { CompanyService } from "@/lib/services/company.service";

const createSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
});

const updateSchema = createSchema.partial();

export const CompanyController = {
  async getAll(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "companies.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const companies = await CompanyService.findAll(ctx.orgId);
    return NextResponse.json(companies);
  },

  async getOne(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const company = await CompanyService.findById(id, ctx.orgId);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  },

  async create(req: Request) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "companies.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const company = await CompanyService.create(parsed.data, ctx.orgId);
    return NextResponse.json(company, { status: 201 });
  },

  async update(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "companies.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const company = await CompanyService.update(id, ctx.orgId, parsed.data);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  },

  async remove(req: Request, id: string) {
    const ctx = await resolveAuth(req);
    if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!can(ctx.role, "companies.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const deleted = await CompanyService.delete(id, ctx.orgId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
