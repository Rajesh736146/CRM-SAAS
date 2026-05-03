import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1),
  name: z.string().min(2),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const { token, name, password } = parsed.data;

  const invitation = await prisma.invitation.findUnique({ where: { token } });
  if (!invitation) return NextResponse.json({ error: "Invalid invitation" }, { status: 404 });
  if (invitation.acceptedAt) return NextResponse.json({ error: "Invitation already used" }, { status: 409 });
  if (invitation.expiresAt < new Date()) return NextResponse.json({ error: "Invitation expired" }, { status: 410 });

  const existing = await prisma.user.findUnique({ where: { email: invitation.email } });
  if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.create({
      data: {
        name,
        email: invitation.email,
        password: hashed,
        role: invitation.role,
        organizationId: invitation.organizationId,
      },
    }),
    prisma.invitation.update({
      where: { token },
      data: { acceptedAt: new Date() },
    }),
  ]);

  return NextResponse.json({ success: true });
}
