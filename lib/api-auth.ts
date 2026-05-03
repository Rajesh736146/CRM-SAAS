import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type AuthContext = {
  userId: string;
  orgId: string;
  role: string;
};

/**
 * Resolves auth from either a session (cookie) or an API key (x-api-key header).
 * Returns null if neither is valid.
 */
export async function resolveAuth(req: Request): Promise<AuthContext | null> {
  // 1. Try API key first
  const apiKey = req.headers.get("x-api-key");
  if (apiKey) {
    const keys = await prisma.apiKey.findMany({
      where: { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
      include: { organization: { include: { users: { where: { role: "OWNER" }, take: 1 } } } },
    });
    for (const k of keys) {
      const valid = await bcrypt.compare(apiKey, k.keyHash);
      if (valid) {
        await prisma.apiKey.update({ where: { id: k.id }, data: { lastUsedAt: new Date() } });
        const owner = k.organization.users[0];
        return { userId: owner?.id ?? "", orgId: k.organizationId, role: "OWNER" };
      }
    }
    return null;
  }

  // 2. Fall back to session
  const session = await auth();
  if (!session?.user) return null;
  return {
    userId: session.user.id!,
    orgId: (session.user as any).organizationId,
    role: (session.user as any).role ?? "MEMBER",
  };
}
