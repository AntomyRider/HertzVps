import ToolsWorkerController from "@/components/controller/worker/tools";
import CardWorkerController from "@/components/controller/worker/card";

const ControllerWorkerPage = () => {
  return (
    <div className="space-y-6">
      <ToolsWorkerController />
      <CardWorkerController />
    </div>
  );
};

export default ControllerWorkerPage;