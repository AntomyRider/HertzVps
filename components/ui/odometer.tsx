"use client";

import { useMemo } from "react";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

function OdometerDigit({ digit }: { digit: number }) {
  return (
    <span className="relative inline-block h-[1em] w-[1ch] overflow-hidden">
      <span
        className="absolute inset-x-0 top-0 flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
        style={{ transform: `translateY(-${digit}em)` }}
      >
        {DIGITS.map((d) => (
          <span
            key={d}
            className="flex h-[1em] items-center justify-center leading-none"
          >
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

const OdometerNumber = ({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) => {
  const items = useMemo(() => {
    const chars = Math.round(value || 0).toLocaleString("th-TH").split("");
    return chars.map((c, i) => ({ c, pos: chars.length - 1 - i }));
  }, [value]);

  return (
    <span
      className={`inline-flex items-end tabular-nums ${className}`}
      style={{ lineHeight: 1 }}
      aria-label={Math.round(value || 0).toLocaleString("th-TH")}
    >
      {items.map(({ c, pos }) =>
        /\d/.test(c) ? (
          <OdometerDigit key={`pos-${pos}`} digit={Number(c)} />
        ) : (
          <span
            key={`pos-${pos}`}
            className="inline-block h-[1em] leading-none"
          >
            {c}
          </span>
        )
      )}
    </span>
  );
};

export default OdometerNumber;
