import { auth } from "@/lib/auth";
import { PipelineService } from "@/lib/services/pipeline.service";
import PipelineBoard from "@/components/pipelines/pipeline-board";
import NewPipelineButton from "@/components/pipelines/new-pipeline-button";

export default async function PipelinesPage() {
  const session = await auth();
  const orgId = (session?.user as any)?.organizationId;

  const pipelines = await PipelineService.findAll(orgId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipelines</h1>
          <p className="text-gray-500 text-sm mt-1">{pipelines.length} pipeline{pipelines.length !== 1 ? "s" : ""}</p>
        </div>
        <NewPipelineButton />
      </div>
      <PipelineBoard pipelines={pipelines} />
    </div>
  );
}
