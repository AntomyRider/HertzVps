import Link from "next/link";
import { Mail } from "lucide-react";

const FooterHome = () => {
  return (
    <footer className="mt-auto w-full border-t border-neutral-800 bg-neutral-950/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">

        <p className="text-sm text-neutral-500">
          © {new Date().getFullYear()} Hertz Manager. All rights reserved.
        </p>

        <Link
          href="/contact"
          className="flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <Mail size={15} />
          ติดต่อเรา
        </Link>
      </div>
    </footer>
  );
};

export default FooterHome;
