import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { PipelineService } from "@/lib/services/pipeline.service";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  name: z.string().min(1),
  stages: z.array(z.object({ name: z.string().min(1), color: z.string().optional() })).optional(),
});

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const pipelines = await PipelineService.findAll(ctx.orgId);
  return NextResponse.json(pipelines);
}

export async function POST(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "pipelines.create")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input", details: parsed.error.flatten() }, { status: 400 });

  const pipeline = await PipelineService.create(ctx.orgId, parsed.data);
  return NextResponse.json(pipeline, { status: 201 });
}
