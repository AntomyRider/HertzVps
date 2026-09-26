import ToolsGroupManageController from "@/components/controller/manage/groups/tools";
import CardGroupManageController from "@/components/controller/manage/groups/card";
import DialogGroupManageController from "@/components/controller/manage/groups/dialog";

const ControllerAccountGroupsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <ToolsGroupManageController accountId={id} />
      <CardGroupManageController accountId={id} />
      <DialogGroupManageController accountId={id} />
    </div>
  );
};

export default ControllerAccountGroupsPage;
