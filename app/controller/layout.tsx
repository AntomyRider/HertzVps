import SidebarController from "@/components/controller/utils/sidebar";
import HeaderController from "@/components/controller/utils/header";
import ControllerAuthGuard from "@/components/controller/auth/guard";

const LayoutController = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <ControllerAuthGuard>
      <div className="min-h-screen">
        <SidebarController />

        <main className="flex min-h-screen flex-col space-y-6 bg-black p-4 pt-18 text-white sm:p-6 lg:ml-64 lg:pt-6">
          <HeaderController />

          <div className="flex min-h-0 flex-1 flex-col rounded-md bg-neutral-900/40 p-4 sm:p-6">
            {children}
          </div>
        </main>
      </div>
    </ControllerAuthGuard>
  );
};

export default LayoutController;