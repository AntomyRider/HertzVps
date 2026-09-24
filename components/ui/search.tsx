import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SearchUIProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  className?: string;
}

const SearchUI = ({
  className = "",
  placeholder = "ค้นหา...",
  ...props
}: SearchUIProps) => {
  return (
    <div
      className={cn(
        "flex h-10 w-full sm:w-auto items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900 px-3 transition-colors focus-within:border-neutral-700",
        className
      )}
    >
      <Search size={17} className="shrink-0 text-neutral-500" />

      <input
        {...props}
        type="text"
        placeholder={placeholder}
        className="w-full min-w-0 sm:w-[240px] md:w-[280px] bg-transparent text-sm text-white outline-none placeholder:text-neutral-500"
      />
    </div>
  );
};

export default SearchUI;