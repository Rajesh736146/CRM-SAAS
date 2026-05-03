import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { PipelineService } from "@/lib/services/pipeline.service";

export const dynamic = "force-dynamic";

const stageSchema = z.object({
  name: z.string().min(1),
  color: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "pipelines.update")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const stage = await PipelineService.addStage(params.id, ctx.orgId, parsed.data);
  if (!stage) return NextResponse.json({ error: "Pipeline not found" }, { status: 404 });
  return NextResponse.json(stage, { status: 201 });
}
