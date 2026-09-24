import NavbarUser from "@/components/user/utils/navbar";
import AuthProvider from "@/components/user/utils/auth-provider";
import FooterHome from "@/components/user/utils/footer";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthProvider>
      <div className="flex min-h-screen flex-col text-white">
        <NavbarUser />

        <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 sm:px-6 xl:px-0">
          {children}
        </main>
        <FooterHome />
      </div>
    </AuthProvider>
  );
}