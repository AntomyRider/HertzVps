import { redirect } from "next/navigation";

const ControlAccountGroupsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;
  redirect(`/control/worker/${id}`);
};

export default ControlAccountGroupsPage;
