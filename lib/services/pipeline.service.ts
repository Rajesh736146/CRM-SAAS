import { prisma } from "@/lib/prisma";

export const PipelineService = {
  async findAll(organizationId: string) {
    return prisma.pipeline.findMany({
      where: { organizationId },
      include: { stages: { orderBy: { order: "asc" } }, _count: { select: { deals: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async findById(id: string, organizationId: string) {
    return prisma.pipeline.findFirst({
      where: { id, organizationId },
      include: {
        stages: { orderBy: { order: "asc" } },
        deals: { include: { contact: true, company: true } },
      },
    });
  },

  async create(organizationId: string, data: { name: string; stages?: { name: string; color?: string }[] }) {
    const defaultStages = data.stages ?? [
      { name: "New", color: "#94a3b8" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "Won", color: "#22c55e" },
      { name: "Lost", color: "#ef4444" },
    ];

    return prisma.pipeline.create({
      data: {
        name: data.name,
        organizationId,
        stages: {
          create: defaultStages.map((s, i) => ({ name: s.name, color: s.color ?? "#6366f1", order: i })),
        },
      },
      include: { stages: { orderBy: { order: "asc" } } },
    });
  },

  async update(id: string, organizationId: string, data: { name?: string }) {
    const existing = await prisma.pipeline.findFirst({ where: { id, organizationId } });
    if (!existing) return null;
    return prisma.pipeline.update({ where: { id }, data });
  },

  async delete(id: string, organizationId: string) {
    const existing = await prisma.pipeline.findFirst({ where: { id, organizationId } });
    if (!existing) return false;
    await prisma.pipeline.delete({ where: { id } });
    return true;
  },

  async addStage(pipelineId: string, organizationId: string, data: { name: string; color?: string }) {
    const pipeline = await prisma.pipeline.findFirst({ where: { id: pipelineId, organizationId } });
    if (!pipeline) return null;
    const maxOrder = await prisma.pipelineStage.aggregate({
      where: { pipelineId },
      _max: { order: true },
    });
    return prisma.pipelineStage.create({
      data: { name: data.name, color: data.color ?? "#6366f1", order: (maxOrder._max.order ?? -1) + 1, pipelineId },
    });
  },

  async updateStage(stageId: string, organizationId: string, data: { name?: string; color?: string; order?: number }) {
    const stage = await prisma.pipelineStage.findFirst({
      where: { id: stageId, pipeline: { organizationId } },
    });
    if (!stage) return null;
    return prisma.pipelineStage.update({ where: { id: stageId }, data });
  },

  async deleteStage(stageId: string, organizationId: string) {
    const stage = await prisma.pipelineStage.findFirst({
      where: { id: stageId, pipeline: { organizationId } },
    });
    if (!stage) return false;
    await prisma.pipelineStage.delete({ where: { id: stageId } });
    return true;
  },
};
