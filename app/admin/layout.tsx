import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import SidebarAdmin from "@/components/admin/utils/sidebar";

const LayoutAdmin = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const auth = await requireAdmin();
  if (!auth.authorized) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black">
      <SidebarAdmin />

      <main className="min-h-screen text-white lg:ml-64 p-4 sm:p-6 pt-18 lg:pt-6">
        {children}
      </main>
    </div>
  );
};

export default LayoutAdmin;