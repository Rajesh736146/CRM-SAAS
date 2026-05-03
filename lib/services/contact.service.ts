import { prisma } from "@/lib/prisma";
import { logAudit } from "./audit.service";
import { WebhookService } from "./webhook.service";

export type CreateContactInput = {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  status?: "LEAD" | "PROSPECT" | "CUSTOMER" | "CHURNED";
  companyId?: string;
};

export type UpdateContactInput = Partial<CreateContactInput>;

export const ContactService = {
  async findAll(organizationId: string) {
    return prisma.contact.findMany({
      where: { organizationId },
      include: { company: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string, organizationId: string) {
    return prisma.contact.findFirst({
      where: { id, organizationId },
      include: { company: true, deals: true, activities: true },
    });
  },

  async create(data: CreateContactInput, organizationId: string, userId: string) {
    const contact = await prisma.contact.create({
      data: { ...data, organizationId },
    });
    await logAudit({ action: "contact.created", entityType: "Contact", entityId: contact.id, after: contact, userId, organizationId });
    await WebhookService.dispatch(organizationId, "contact.created", contact);
    return contact;
  },

  async update(id: string, organizationId: string, data: UpdateContactInput, userId: string) {
    const before = await prisma.contact.findFirst({ where: { id, organizationId } });
    if (!before) return null;
    const after = await prisma.contact.update({ where: { id }, data });
    await logAudit({ action: "contact.updated", entityType: "Contact", entityId: id, before, after, userId, organizationId });
    await WebhookService.dispatch(organizationId, "contact.updated", after);
    return after;
  },

  async delete(id: string, organizationId: string, userId: string) {
    const before = await prisma.contact.findFirst({ where: { id, organizationId } });
    if (!before) return false;
    await prisma.contact.delete({ where: { id } });
    await logAudit({ action: "contact.deleted", entityType: "Contact", entityId: id, before, userId, organizationId });
    await WebhookService.dispatch(organizationId, "contact.deleted", { id });
    return true;
  },
};
