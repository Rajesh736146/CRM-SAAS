import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { CompanyService } from "@/lib/services/company.service";

const createSchema = z.object({
  name: z.string().min(1),
  website: z.string().url().optional().or(z.literal("")),
  industry: z.string().optional(),
  size: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function getOrgId(): Promise<{ orgId: string } | NextResponse> {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const orgId = (session.user as any)?.organizationId;
  if (!orgId) return NextResponse.json({ error: "No organization" }, { status: 403 });
  return { orgId };
}

export const CompanyController = {
  async getAll() {
    const result = await getOrgId();
    if (result instanceof NextResponse) return result;
    const companies = await CompanyService.findAll(result.orgId);
    return NextResponse.json(companies);
  },

  async getOne(id: string) {
    const result = await getOrgId();
    if (result instanceof NextResponse) return result;
    const company = await CompanyService.findById(id, result.orgId);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  },

  async create(req: Request) {
    const result = await getOrgId();
    if (result instanceof NextResponse) return result;
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const company = await CompanyService.create(parsed.data, result.orgId);
    return NextResponse.json(company, { status: 201 });
  },

  async update(req: Request, id: string) {
    const result = await getOrgId();
    if (result instanceof NextResponse) return result;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });
    }
    const company = await CompanyService.update(id, result.orgId, parsed.data);
    if (!company) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(company);
  },

  async remove(id: string) {
    const result = await getOrgId();
    if (result instanceof NextResponse) return result;
    const deleted = await CompanyService.delete(id, result.orgId);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  },
};
