import { CompanyController } from "@/lib/controllers/company.controller";

export const GET = () => CompanyController.getAll();
export const POST = (req: Request) => CompanyController.create(req);
