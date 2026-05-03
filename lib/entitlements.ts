import { prisma } from "@/lib/prisma";

type Plan = "FREE" | "PRO" | "ENTERPRISE";

const PLANS: Record<Plan, {
  contacts: number;
  deals: number;
  seats: number;
  customFields: boolean;
  apiAccess: boolean;
  webhooks: boolean;
  pipelines: number;
}> = {
  FREE:       { contacts: 250,  deals: 50,   seats: 2,  customFields: false, apiAccess: false, webhooks: false, pipelines: 1 },
  PRO:        { contacts: 5000, deals: 1000, seats: 10, customFields: true,  apiAccess: false, webhooks: true,  pipelines: 10 },
  ENTERPRISE: { contacts: -1,   deals: -1,   seats: -1, customFields: true,  apiAccess: true,  webhooks: true,  pipelines: -1 },
};

export function getEntitlements(plan: Plan) {
  return PLANS[plan] ?? PLANS.FREE;
}

export async function checkLimit(
  organizationId: string,
  resource: "contacts" | "deals"
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  const plan = (org?.plan ?? "FREE") as Plan;
  const limits = getEntitlements(plan);
  const limit = limits[resource];

  if (limit === -1) return { allowed: true, limit: -1, current: 0 };

  const current = resource === "contacts"
    ? await prisma.contact.count({ where: { organizationId } })
    : await prisma.deal.count({ where: { organizationId } });

  return { allowed: current < limit, limit, current };
}

export async function canUseFeature(
  organizationId: string,
  feature: keyof ReturnType<typeof getEntitlements>
): Promise<boolean> {
  const org = await prisma.organization.findUnique({ where: { id: organizationId } });
  const plan = (org?.plan ?? "FREE") as Plan;
  const entitlements = getEntitlements(plan);
  return Boolean(entitlements[feature]);
}
