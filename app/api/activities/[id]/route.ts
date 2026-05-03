import { ActivityController } from "@/lib/controllers/activity.controller";

export const dynamic = "force-dynamic";

export const GET = (_req: Request, { params }: { params: { id: string } }) =>
  ActivityController.getOne(params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  ActivityController.update(req, params.id);

export const DELETE = (_req: Request, { params }: { params: { id: string } }) =>
  ActivityController.remove(params.id);
