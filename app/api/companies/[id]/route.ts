import { CompanyController } from "@/lib/controllers/company.controller";

export const dynamic = "force-dynamic";

export const GET = (_req: Request, { params }: { params: { id: string } }) =>
  CompanyController.getOne(params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  CompanyController.update(req, params.id);

export const DELETE = (_req: Request, { params }: { params: { id: string } }) =>
  CompanyController.remove(params.id);
