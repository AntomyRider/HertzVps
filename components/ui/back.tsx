import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackUIProps {
  text?: string;
  href?: string;
  className?: string;
}

const BackUI = ({
  text = "ย้อนกลับ",
  href = "/",
  className = "",
}: BackUIProps) => {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white",
        className
      )}
    >
      <ArrowLeft size={17} />
      {text && <span>{text}</span>}
    </Link>
  );
};

export default BackUI;