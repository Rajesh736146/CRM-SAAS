import { auth } from "@/lib/auth";
import { AuditService } from "@/lib/services/audit.service";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

const ACTION_COLORS: Record<string, string> = {
  "contact.created": "bg-green-100 text-green-700",
  "contact.updated": "bg-blue-100 text-blue-700",
  "contact.deleted": "bg-red-100 text-red-700",
  "deal.created": "bg-green-100 text-green-700",
  "deal.updated": "bg-blue-100 text-blue-700",
  "deal.stage_changed": "bg-purple-100 text-purple-700",
  "deal.deleted": "bg-red-100 text-red-700",
};

export default async function AuditLogPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const logs = await AuditService.findAll(orgId, 100);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Log</h1>
        <p className="text-gray-500 text-sm mt-1">All changes in your organization</p>
      </div>

      <div className="bg-white rounded-xl border divide-y">
        {logs.length === 0 ? (
          <p className="text-center py-10 text-gray-400">No audit events yet</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4">
              <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                {log.action}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{log.user?.name ?? log.user?.email}</span>
                  {" · "}
                  <span className="text-gray-400">{log.entityType} {log.entityId.slice(0, 8)}...</span>
                </p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{formatDate(log.createdAt)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
