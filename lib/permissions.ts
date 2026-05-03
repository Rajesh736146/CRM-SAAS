type Role = "OWNER" | "ADMIN" | "MEMBER";

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  OWNER:  ["*"],
  ADMIN:  [
    "contacts.*", "deals.*", "companies.*", "activities.*",
    "pipelines.*", "custom_fields.*", "webhooks.*",
    "settings.read", "team.read", "team.invite",
    "audit_log.read", "emails.*",
  ],
  MEMBER: [
    "contacts.read", "contacts.create", "contacts.update",
    "deals.read", "deals.create", "deals.update",
    "companies.read", "companies.create",
    "activities.*",
    "emails.read", "emails.create",
  ],
};

export function can(role: string, action: string): boolean {
  const perms = ROLE_PERMISSIONS[role as Role] ?? [];
  if (perms.includes("*")) return true;
  if (perms.includes(action)) return true;
  const resource = action.split(".")[0];
  return perms.includes(`${resource}.*`);
}

export function requirePermission(role: string, action: string): void {
  if (!can(role, action)) {
    throw new Error(`Forbidden: requires ${action}`);
  }
}
