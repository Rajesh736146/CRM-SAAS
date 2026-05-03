import { auth } from "@/lib/auth";
import { WebhookService } from "@/lib/services/webhook.service";
import WebhooksManager from "@/components/settings/webhooks-manager";
import { canUseFeature } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export default async function WebhooksPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const [webhooks, hasAccess] = await Promise.all([
    WebhookService.findAll(orgId),
    canUseFeature(orgId, "webhooks"),
  ]);

  const safeWebhooks = webhooks.map(({ secret: _, ...w }) => w);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Webhooks</h1>
        <p className="text-gray-500 text-sm mt-1">Receive real-time events when data changes</p>
      </div>
      {!hasAccess && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          Webhooks require the PRO plan or higher.
        </div>
      )}
      <WebhooksManager webhooks={safeWebhooks} canCreate={hasAccess} />
    </div>
  );
}
