import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { canUseFeature } from "@/lib/entitlements";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  name: z.string().min(1),
  expiresAt: z.string().optional(),
});

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "settings.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const keys = await prisma.apiKey.findMany({
    where: { organizationId: ctx.orgId },
    select: { id: true, name: true, lastUsedAt: true, expiresAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(keys);
}

export async function POST(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "settings.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const allowed = await canUseFeature(ctx.orgId, "apiAccess");
  if (!allowed) return NextResponse.json({ error: "API access requires ENTERPRISE plan" }, { status: 403 });

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const rawKey = `crm_${crypto.randomBytes(32).toString("hex")}`;
  const keyHash = await bcrypt.hash(rawKey, 10);

  await prisma.apiKey.create({
    data: {
      name: parsed.data.name,
      keyHash,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      organizationId: ctx.orgId,
    },
  });

  // Return the raw key ONCE — it cannot be retrieved again
  return NextResponse.json({ key: rawKey, message: "Store this key securely. It will not be shown again." }, { status: 201 });
}
