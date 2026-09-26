import ToolsLoggerController from "@/components/controller/logger/tools";
import TerminalLoggerController from "@/components/controller/logger/terminal";

const ControllerLoggerPage = () => {
  return (
    <div className="space-y-6">
      <ToolsLoggerController />
      <TerminalLoggerController />
    </div>
  );
};

export default ControllerLoggerPage;
