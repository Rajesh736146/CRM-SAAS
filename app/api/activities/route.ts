import { ActivityController } from "@/lib/controllers/activity.controller";

export const dynamic = "force-dynamic";

export const GET = (req: Request) => ActivityController.getAll(req);
export const POST = (req: Request) => ActivityController.create(req);
