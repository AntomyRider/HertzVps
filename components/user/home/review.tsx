"use client";

import { Star, Quote } from "lucide-react";
import FadeIn from "@/components/ui/fade-in";
import { useReviewStore, type ReviewItem } from "@/store/reviewStore";

const ReviewCard = ({ item }: { item: ReviewItem }) => {
  const initial = item.name.trim().charAt(0).toUpperCase();

  return (
    <div className="flex w-[290px] shrink-0 flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950/90 p-5 transition hover:border-neutral-700 sm:w-[350px]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: item.rating }).map((_, idx) => (
              <Star
                key={idx}
                size={14}
                strokeWidth={1.8}
                className="fill-blue-500 text-blue-500"
              />
            ))}
          </div>

          <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900 px-2.5 py-0.5 text-xs font-semibold text-blue-400">
            {item.tag}
          </span>
        </div>

        <p className="mt-3.5 text-sm leading-relaxed text-neutral-400">
          {item.comment}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-neutral-900 pt-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md border border-blue-500/20 bg-blue-500/10 text-xs font-bold text-blue-400">
            {initial}
          </div>
          <span className="text-sm font-semibold text-white">{item.name}</span>
        </div>

        <Quote
          size={16}
          strokeWidth={1.8}
          className="text-neutral-600"
        />
      </div>
    </div>
  );
};

const ReviewHome = () => {
  const { topRowReviews, bottomRowReviews } = useReviewStore();

  const topTrack = [...topRowReviews, ...topRowReviews];
  const bottomTrack = [...bottomRowReviews, ...bottomRowReviews];

  return (
    <section className="w-full py-12 sm:py-24">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <FadeIn direction="up" className="px-4 text-center sm:px-6">
          <span className="text-xs font-medium text-blue-500 sm:text-sm">
            เสียงตอบรับจากผู้ใช้งาน
          </span>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
            รีวิวจากผู้ใช้งานจริง
          </h2>

          <p className="mt-3 text-sm text-neutral-400 sm:text-base">
            ความประทับใจจากผู้ใช้งานที่เปลี่ยนมาใช้ระบบอัตโนมัติของ Hertz Manager
          </p>
        </FadeIn>

        {/* Dual-Track Alternating Marquee with Left & Right Background Edge Gradients */}
        <FadeIn direction="up" delay={100} className="mt-12">
          <div
            className="relative w-full overflow-hidden py-2"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)",
            }}
          >
            {/* Left & Right Gradient Overlays to blend with background */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black via-black/70 to-transparent sm:w-28"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black via-black/70 to-transparent sm:w-28"
            />

            <div className="space-y-4">
              {/* Track 1: Right to Left */}
              <div className="flex w-max gap-4 animate-[marquee-left_38s_linear_infinite] hover:[animation-play-state:paused]">
                {topTrack.map((item, idx) => (
                  <ReviewCard key={`top-${item.id}-${idx}`} item={item} />
                ))}
              </div>

              {/* Track 2: Left to Right */}
              <div className="flex w-max gap-4 animate-[marquee-right_38s_linear_infinite] hover:[animation-play-state:paused]">
                {bottomTrack.map((item, idx) => (
                  <ReviewCard key={`bottom-${item.id}-${idx}`} item={item} />
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};

export default ReviewHome;
