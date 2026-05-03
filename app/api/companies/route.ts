import { CompanyController } from "@/lib/controllers/company.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => CompanyController.getAll(req);
export const POST = (req: Request) => CompanyController.create(req);
