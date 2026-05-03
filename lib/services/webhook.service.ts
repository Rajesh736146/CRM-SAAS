import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export const WebhookService = {
  async findAll(organizationId: string) {
    return prisma.webhook.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" } });
  },

  async create(organizationId: string, data: { url: string; events: string[] }) {
    const secret = crypto.randomBytes(32).toString("hex");
    return prisma.webhook.create({
      data: { ...data, secret, organizationId },
    });
  },

  async update(id: string, organizationId: string, data: { url?: string; events?: string[]; active?: boolean }) {
    const existing = await prisma.webhook.findFirst({ where: { id, organizationId } });
    if (!existing) return null;
    return prisma.webhook.update({ where: { id }, data });
  },

  async delete(id: string, organizationId: string) {
    const existing = await prisma.webhook.findFirst({ where: { id, organizationId } });
    if (!existing) return false;
    await prisma.webhook.delete({ where: { id } });
    return true;
  },

  async dispatch(organizationId: string, event: string, payload: object) {
    const hooks = await prisma.webhook.findMany({
      where: { organizationId, active: true, events: { has: event } },
    });

    await Promise.allSettled(
      hooks.map((hook) => {
        const body = JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() });
        const sig = crypto.createHmac("sha256", hook.secret).update(body).digest("hex");
        return fetch(hook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CRM-Signature": `sha256=${sig}`,
            "X-CRM-Event": event,
          },
          body,
        }).catch(() => null); // never throw on delivery failure
      })
    );
  },
};
