import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApiKeysManager from "@/components/settings/api-keys-manager";
import { canUseFeature } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const [keys, hasAccess] = await Promise.all([
    prisma.apiKey.findMany({
      where: { organizationId: orgId },
      select: { id: true, name: true, lastUsedAt: true, expiresAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    canUseFeature(orgId, "apiAccess"),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
        <p className="text-gray-500 text-sm mt-1">Programmatic access to your CRM data</p>
      </div>
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          API access requires the ENTERPRISE plan. Upgrade to generate API keys.
        </div>
      )}
      <ApiKeysManager keys={keys} canCreate={hasAccess} />
    </div>
  );
}
