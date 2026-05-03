import { CompanyController } from "@/lib/controllers/company.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request, { params }: { params: { id: string } }) =>
  CompanyController.getOne(req, params.id);

export const PATCH = (req: Request, { params }: { params: { id: string } }) =>
  CompanyController.update(req, params.id);

export const DELETE = (req: Request, { params }: { params: { id: string } }) =>
  CompanyController.remove(req, params.id);
