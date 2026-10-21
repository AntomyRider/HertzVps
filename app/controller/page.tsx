import ChartOverviewController from "@/components/controller/overview/chart";
import DonutOverviewController from "@/components/controller/overview/donut";
import StatsOverviewController from "@/components/controller/overview/stats";

const ControllerOverviewPage = () => {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row min-w-0 flex-1 gap-4">
        <div className="min-w-0 flex-[2]">
          <ChartOverviewController />
        </div>

        <div className="min-w-0 flex-1">
          <DonutOverviewController />
        </div>
      </div>

      <StatsOverviewController />
    </div>
  );
};

export default ControllerOverviewPage;