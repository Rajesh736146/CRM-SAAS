import { ContactController } from "@/lib/controllers/contact.controller";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  ContactController.getOne(req, params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  ContactController.update(req, params.id);

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  ContactController.remove(req, params.id);
