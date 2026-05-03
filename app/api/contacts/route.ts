import { ContactController } from "@/lib/controllers/contact.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => ContactController.getAll(req);
export const POST = (req: Request) => ContactController.create(req);
