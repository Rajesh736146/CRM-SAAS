import { prisma } from "@/lib/prisma";

export type CreateActivityInput = {
  type: "CALL" | "EMAIL" | "MEETING" | "TASK" | "NOTE";
  title: string;
  description?: string;
  dueDate?: string;
  contactId?: string;
  companyId?: string;
  dealId?: string;
};

export type UpdateActivityInput = Partial<CreateActivityInput> & {
  completed?: boolean;
};

export const ActivityService = {
  async findAll(organizationId: string) {
    return prisma.activity.findMany({
      where: { user: { organizationId } },
      include: { contact: true, deal: true, user: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string, organizationId: string) {
    return prisma.activity.findFirst({
      where: { id, user: { organizationId } },
      include: { contact: true, deal: true, user: true },
    });
  },

  async create(data: CreateActivityInput, userId: string) {
    const { dueDate, ...rest } = data;
    return prisma.activity.create({
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        userId,
      },
    });
  },

  async update(id: string, organizationId: string, data: UpdateActivityInput) {
    const existing = await prisma.activity.findFirst({
      where: { id, user: { organizationId } },
    });
    if (!existing) return null;
    const { dueDate, ...rest } = data;
    return prisma.activity.update({
      where: { id },
      data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
    });
  },

  async delete(id: string, organizationId: string) {
    const existing = await prisma.activity.findFirst({
      where: { id, user: { organizationId } },
    });
    if (!existing) return false;
    await prisma.activity.delete({ where: { id } });
    return true;
  },
};
