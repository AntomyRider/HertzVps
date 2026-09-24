import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

interface ButtonUIProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  isLoading?: boolean;
}

const ButtonUI = ({
  children,
  className = "",
  type = "button",
  href,
  isLoading = false,
  disabled,
  ...props
}: ButtonUIProps) => {
  const classNames = cn(
    "inline-flex items-center justify-center rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50",
    className
  );

  if (href) {
    return (
      <Link href={href} className={classNames}>
        {isLoading ? <Loader size={16} className="animate-spin" /> : children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={classNames}
      {...props}
    >
      {isLoading ? <Loader size={16} className="animate-spin" /> : children}
    </button>
  );
};

export default ButtonUI;