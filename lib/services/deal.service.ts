import { prisma } from "@/lib/prisma";
import { logAudit } from "./audit.service";
import { WebhookService } from "./webhook.service";

export type CreateDealInput = {
  title: string;
  value?: number;
  pipelineId?: string;
  stageId?: string;
  closeDate?: string;
  contactId?: string;
  companyId?: string;
};

export type UpdateDealInput = Partial<CreateDealInput>;

export const DealService = {
  async findAll(organizationId: string) {
    return prisma.deal.findMany({
      where: { organizationId },
      include: { contact: true, company: true, stage: true, pipeline: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string, organizationId: string) {
    return prisma.deal.findFirst({
      where: { id, organizationId },
      include: { contact: true, company: true, stage: true, pipeline: true, activities: true },
    });
  },

  async create(data: CreateDealInput, organizationId: string, userId: string) {
    const { closeDate, ...rest } = data;
    const deal = await prisma.deal.create({
      data: { ...rest, closeDate: closeDate ? new Date(closeDate) : undefined, organizationId },
    });
    await logAudit({ action: "deal.created", entityType: "Deal", entityId: deal.id, after: deal, userId, organizationId });
    await WebhookService.dispatch(organizationId, "deal.created", deal);
    return deal;
  },

  async update(id: string, organizationId: string, data: UpdateDealInput, userId: string) {
    const before = await prisma.deal.findFirst({ where: { id, organizationId } });
    if (!before) return null;
    const { closeDate, ...rest } = data;
    const after = await prisma.deal.update({
      where: { id },
      data: { ...rest, closeDate: closeDate ? new Date(closeDate) : undefined },
    });
    const action = data.stageId && data.stageId !== before.stageId ? "deal.stage_changed" : "deal.updated";
    await logAudit({ action, entityType: "Deal", entityId: id, before, after, userId, organizationId });
    await WebhookService.dispatch(organizationId, action, after);
    return after;
  },

  async delete(id: string, organizationId: string, userId: string) {
    const before = await prisma.deal.findFirst({ where: { id, organizationId } });
    if (!before) return false;
    await prisma.deal.delete({ where: { id } });
    await logAudit({ action: "deal.deleted", entityType: "Deal", entityId: id, before, userId, organizationId });
    await WebhookService.dispatch(organizationId, "deal.deleted", { id });
    return true;
  },
};
