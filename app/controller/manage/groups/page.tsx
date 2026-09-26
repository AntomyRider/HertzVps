import ToolsGroupManageController from "@/components/controller/manage/groups/tools";
import CardGroupManageController from "@/components/controller/manage/groups/card";
import DialogGroupManageController from "@/components/controller/manage/groups/dialog";

const ControllerGroupsPage = () => {
  return (
    <div className="space-y-6">
      <ToolsGroupManageController accountId="acc-1" />
      <CardGroupManageController accountId="acc-1" />
      <DialogGroupManageController accountId="acc-1" />
    </div>
  );
};

export default ControllerGroupsPage;