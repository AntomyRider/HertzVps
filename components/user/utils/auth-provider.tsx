"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { toast } from "@/components/ui/toast";

function AuthErrorNotifier() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const authError = searchParams.get("auth_error");
    if (authError) {
      const errorMessages: Record<string, string> = {
        access_denied: "คุณได้ยกเลิกการเข้าสู่ระบบผ่าน Discord",
        invalid_state: "CSRF State ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
        missing_code: "ไม่พบรหัสยืนยันจาก Discord กรุณาลองใหม่",
        server_misconfiguration: "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า Discord Client ID/Secret ใน .env",
        oauth_failed: "เข้าสู่ระบบ Discord ล้มเหลว กรุณาตรวจสอบ Redirect URI ใน Discord Developer Portal",
      };

      toast.error(errorMessages[authError] || `เข้าสู่ระบบไม่สำเร็จ (${authError})`);

      const newParams = new URLSearchParams(searchParams.toString());
      newParams.delete("auth_error");
      const cleanUrl = newParams.toString() ? `${pathname}?${newParams.toString()}` : pathname;
      router.replace(cleanUrl);
    }
  }, [searchParams, router, pathname]);

  return null;
}

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const fetchUser = useAuthStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return (
    <>
      <Suspense fallback={null}>
        <AuthErrorNotifier />
      </Suspense>
      {children}
    </>
  );
}
