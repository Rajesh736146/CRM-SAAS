import { NextResponse } from "next/server";
import { z } from "zod";
import { resolveAuth } from "@/lib/api-auth";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MEMBER"]).default("MEMBER"),
});

export async function POST(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "team.invite")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { email, role } = parsed.data;

  // Check if already a member
  const existing = await prisma.user.findFirst({ where: { email, organizationId: ctx.orgId } });
  if (existing) return NextResponse.json({ error: "User is already a member" }, { status: 409 });

  // Check seat limit
  const org = await prisma.organization.findUnique({
    where: { id: ctx.orgId },
    include: { _count: { select: { users: true } } },
  });
  if (org && org.plan === "FREE" && org._count.users >= org.seats) {
    return NextResponse.json({ error: "Seat limit reached. Upgrade your plan." }, { status: 403 });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const invitation = await prisma.invitation.create({
    data: { email, role, organizationId: ctx.orgId, expiresAt },
  });

  // In production: send email with invitation.token via Resend
  // For now return the token so it can be tested
  return NextResponse.json({
    success: true,
    inviteUrl: `${process.env.NEXTAUTH_URL}/invite/${invitation.token}`,
  }, { status: 201 });
}

export async function GET(req: Request) {
  const ctx = await resolveAuth(req);
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!can(ctx.role, "team.read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const invitations = await prisma.invitation.findMany({
    where: { organizationId: ctx.orgId, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invitations);
}
