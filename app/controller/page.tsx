import MonitorController from "@/components/controller/overview/monitor";
import ContainerController from "@/components/controller/overview/container";

const ControllerOverviewPage = () => {
  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <MonitorController />
      <ContainerController />
    </div>
  );
};

export default ControllerOverviewPage;