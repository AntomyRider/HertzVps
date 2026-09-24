import Image from "next/image";

const DescriptionHome = () => {
  return (
    <section className="w-full px-4 sm:px-6 py-12 sm:py-24">
      <div className="grid max-w-7xl w-full mx-auto items-center gap-8 md:gap-12 md:grid-cols-2">
        <div>
          <span className="text-xs sm:text-sm font-medium text-blue-500">
            ทำไมต้องโปรแกรมของเรา?
          </span>

          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-white md:text-4xl">
            จัดการงานของคุณ
            <br />
            ได้ง่ายขึ้นในที่เดียว!
          </h2>

          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-neutral-400 md:text-lg">
            Hertz Manager ช่วยให้การทำงานของคุณเป็นเรื่องง่าย
            ด้วยระบบจัดการบัญชี การโพสต์ และการทำงานอัตโนมัติ
            ที่ออกแบบมาให้ใช้งานได้สะดวกและรวดเร็ว
          </p>
        </div>

        {/* Image */}
        <div className="w-full [perspective:1200px]">
          <div className="transform-gpu overflow-hidden rounded-xl sm:rounded-2xl border border-neutral-800 [transform:none] md:[transform:rotateY(-18deg)_rotateX(8deg)]">
            <Image
              src="/hertz.png"
              alt="Hertz Manager"
              width={640}
              height={360}
              className="w-full h-auto object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default DescriptionHome;
