import { ActivityController } from "@/lib/controllers/activity.controller";

export const GET = () => ActivityController.getAll();
export const POST = (req: Request) => ActivityController.create(req);
