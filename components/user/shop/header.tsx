import FadeIn from "@/components/ui/fade-in";

const HeaderShop = () => {
  return (
    <FadeIn direction="up" className="mb-6 mt-6 sm:mb-10 sm:mt-10 text-center">
      <div className="flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
          ร้านค้า
        </h1>

        <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-400 md:text-base max-w-md sm:max-w-none">
          เลือกสินค้าและบริการที่ต้องการ พร้อมเริ่มต้นใช้งานได้ทันที
        </p>
      </div>
    </FadeIn>
  );
};

export default HeaderShop;
