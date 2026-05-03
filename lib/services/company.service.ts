import { prisma } from "@/lib/prisma";

export type CreateCompanyInput = {
  name: string;
  website?: string;
  industry?: string;
  size?: string;
};

export type UpdateCompanyInput = Partial<CreateCompanyInput>;

export const CompanyService = {
  async findAll(organizationId: string) {
    return prisma.company.findMany({
      where: { organizationId },
      include: { _count: { select: { contacts: true, deals: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string, organizationId: string) {
    return prisma.company.findFirst({
      where: { id, organizationId },
      include: { contacts: true, deals: true },
    });
  },

  async create(data: CreateCompanyInput, organizationId: string) {
    return prisma.company.create({
      data: { ...data, organizationId },
    });
  },

  async update(id: string, organizationId: string, data: UpdateCompanyInput) {
    const existing = await prisma.company.findFirst({ where: { id, organizationId } });
    if (!existing) return null;
    return prisma.company.update({ where: { id }, data });
  },

  async delete(id: string, organizationId: string) {
    const existing = await prisma.company.findFirst({ where: { id, organizationId } });
    if (!existing) return false;
    await prisma.company.delete({ where: { id } });
    return true;
  },
};
