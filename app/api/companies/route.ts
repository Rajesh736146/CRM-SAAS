import { CompanyController } from "@/lib/controllers/company.controller";

export const dynamic = "force-dynamic";

export const GET = () => CompanyController.getAll();
export const POST = (req: Request) => CompanyController.create(req);
