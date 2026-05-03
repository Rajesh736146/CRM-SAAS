import { ActivityController } from "@/lib/controllers/activity.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  ActivityController.getOne(req, params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  ActivityController.update(req, params.id);

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  ActivityController.remove(req, params.id);
