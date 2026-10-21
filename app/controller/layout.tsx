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
      <div className="h-screen h-[100dvh] overflow-hidden bg-black text-white">
        <SidebarController />

        <main className="flex h-screen h-[100dvh] flex-col overflow-hidden bg-neutral-900 p-3 pt-16 pb-20 text-white sm:p-6 sm:pt-18 sm:pb-24 lg:ml-64 lg:p-6 lg:pt-6 lg:pb-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl bg-black p-4 sm:p-6">
            <HeaderController />
            <div className="min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.12)_transparent]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ControllerAuthGuard>
  );
};

export default LayoutController;