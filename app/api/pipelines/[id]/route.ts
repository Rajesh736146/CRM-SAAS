import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { PipelineService } from "@/lib/services/pipeline.service";

const updateSchema = z.object({ name: z.string().min(1).optional() });

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pipeline = await PipelineService.findById(params.id, ctx.orgId);
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pipeline);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "pipelines.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const pipeline = await PipelineService.update(params.id, ctx.orgId, parsed.data);
  if (!pipeline) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(pipeline);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "pipelines.delete")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const deleted = await PipelineService.delete(params.id, ctx.orgId);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
