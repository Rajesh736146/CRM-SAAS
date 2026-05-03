import { prisma } from "@/lib/prisma";

type AuditParams = {
  action: string;
  entityType: string;
  entityId: string;
  before?: object | null;
  after?: object | null;
  userId: string;
  organizationId: string;
};

export async function logAudit(params: AuditParams) {
  return prisma.auditLog.create({
    data: {
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      before: params.before ?? undefined,
      after: params.after ?? undefined,
      userId: params.userId,
      organizationId: params.organizationId,
    },
  });
}

export const AuditService = {
  async findAll(organizationId: string, limit = 50) {
    return prisma.auditLog.findMany({
      where: { organizationId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async findByEntity(entityType: string, entityId: string, organizationId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId, organizationId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
