import { DealController } from "@/lib/controllers/deal.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => DealController.getAll(req);
export const POST = (req: Request) => DealController.create(req);
