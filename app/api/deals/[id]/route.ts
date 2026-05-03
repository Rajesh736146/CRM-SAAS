import { DealController } from "@/lib/controllers/deal.controller";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  DealController.getOne(req, params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  DealController.update(req, params.id);

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  DealController.remove(req, params.id);
