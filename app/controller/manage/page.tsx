import ToolsManageController from "@/components/controller/manage/tools";
import CardManageController from "@/components/controller/manage/card";

const ControllerManagePage = () => {
  return (
    <div className="space-y-6">
      <ToolsManageController />
      <CardManageController />
    </div>
  );
};

export default ControllerManagePage;
