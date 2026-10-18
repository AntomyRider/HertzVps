import Link from "next/link";
import { ButtonHTMLAttributes } from "react";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "primary"
  | "secondary"
  | "ghost"
  | "outline";

interface ButtonUIProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  href?: string;
  isLoading?: boolean;
  variant?: ButtonVariant;
  rainbowBorder?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  default: "bg-cyan-700 text-white hover:bg-cyan-800",
  primary: "bg-cyan-700 text-white hover:bg-cyan-800",
  secondary: "bg-neutral-800 text-white hover:bg-neutral-700 border border-neutral-700/50",
  outline: "border border-neutral-800 bg-transparent text-white hover:bg-neutral-900 hover:border-neutral-700",
  ghost: "bg-neutral-900 text-neutral-300 hover:bg-neutral-800/80 hover:text-white",
};

const RAINBOW_CONIC_BEAM =
  "conic-gradient(from 0deg, transparent 0deg 260deg, rgba(139, 92, 246, 0) 265deg, #8b5cf6 280deg, #00b0ff 295deg, #06b6d4 305deg, #10b981 318deg, #facc15 330deg, #fb923c 342deg, #ff2a5f 354deg, rgba(255, 42, 95, 0) 360deg)";

const ButtonUI = ({
  children,
  className = "",
  type = "button",
  href,
  isLoading = false,
  disabled,
  variant = "default",
  rainbowBorder = false,
  ...props
}: ButtonUIProps) => {
  if (rainbowBorder) {
    const rainbowWrapperClasses = cn(
      "group relative inline-flex items-center justify-center rounded-full p-[1.5px] overflow-hidden bg-neutral-900 transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
      className
    );

    const rainbowContent = (
      <>
        {/* Soft luminous bloom */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[300%] animate-rainbow-spin blur-[2px] opacity-75"
          style={{ background: RAINBOW_CONIC_BEAM }}
        />
        {/* Sharp single rainbow beam line */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 aspect-square w-[300%] animate-rainbow-spin"
          style={{ background: RAINBOW_CONIC_BEAM }}
        />
        {/* Button inner surface */}
        <span
          className={cn(
            "relative z-10 inline-flex w-full h-full items-center justify-center gap-2 rounded-full px-5 py-1.5 text-sm text-white transition",
            variantStyles[variant]
          )}
        >
          {isLoading ? <Loader size={16} className="animate-spin" /> : children}
        </span>
      </>
    );

    if (href) {
      return (
        <Link href={href} className={rainbowWrapperClasses}>
          {rainbowContent}
        </Link>
      );
    }

    return (
      <button
        type={type}
        disabled={disabled || isLoading}
        className={rainbowWrapperClasses}
        {...props}
      >
        {rainbowContent}
      </button>
    );
  }

  const classNames = cn(
    "inline-flex items-center justify-center rounded-full px-5 py-1.5 text-sm text-white transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
    variantStyles[variant],
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