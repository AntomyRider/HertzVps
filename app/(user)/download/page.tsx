import HeaderDownload from "@/components/user/download/header";
import DownloadContainer from "@/components/user/download/container";

export const metadata = {
  title: "ดาวน์โหลดโปรแกรม | Hertz Manager",
  description: "ดาวน์โหลดไฟล์ติดตั้งและตรวจสอบรายการอัปเดตเวอร์ชันของ Hertz APK",
};

const DownloadPageUser = () => {
  return (
    <div>
      <HeaderDownload />
      <DownloadContainer />
    </div>
  );
};

export default DownloadPageUser;
