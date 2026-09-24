"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

import Empty from "@/components/ui/empty";
import ButtonUI from "@/components/ui/button";
import { useCategoryStore } from "@/store/categoryStore";
import { isValidImageUrl } from "@/lib/utils";

export interface CategoryCardProps {
  id?: string;
  name: string;
  image?: string | null;
  description?: string;
  href?: string;
}

export const CategoryCard = ({
  id,
  name,
  image,
  description = "เลือกหมวดหมู่เพื่อดูเพิ่มเติม",
  href,
}: CategoryCardProps) => {
  const linkHref = href || (id ? `/shop/${id}` : "/shop");

  return (
    <div className="rounded-md border border-neutral-800 bg-neutral-950 p-3 sm:p-3.5 transition-colors hover:border-neutral-700">
      {/* Banner Image as Link */}
      <Link href={linkHref} className="block group">
        <div className="relative aspect-[16/5] sm:aspect-[16/4] w-full overflow-hidden rounded-sm bg-neutral-900">
          {isValidImageUrl(image) ? (
            <Image
              src={image!}
              alt={name}
              fill
              className="object-cover transition-opacity duration-200 group-hover:opacity-90"
              unoptimized={image!.startsWith("http")}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-blue-950 via-neutral-900 to-indigo-950 text-xs sm:text-sm font-medium text-neutral-400 px-3 text-center">
              {name}
            </div>
          )}
        </div>
      </Link>

      {/* Card Info & Action */}
      <div className="mt-3 sm:mt-3.5 flex items-center justify-between gap-2.5 sm:gap-4 px-0.5 sm:px-1">
        <div className="min-w-0 flex-1 flex flex-col">
          <Link href={linkHref} className="transition-colors hover:text-blue-400">
            <h3 className="truncate text-sm font-semibold text-white sm:text-base">
              {name}
            </h3>
          </Link>

          <p className="mt-0.5 sm:mt-1 truncate text-[11px] sm:text-xs text-neutral-400">
            {description}
          </p>
        </div>

        <ButtonUI
          href={linkHref}
          className="shrink-0 rounded-sm px-3 py-1.5 sm:px-4 sm:py-2 text-xs text-white transition-colors sm:text-sm"
        >
          สินค้าทั้งหมด
        </ButtonUI>
      </div>
    </div>
  );
};

const CategoryShop = () => {
  const { categories, isLoading, fetchPublicCategories } = useCategoryStore();

  useEffect(() => {
    fetchPublicCategories();
  }, [fetchPublicCategories]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full pb-12 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-neutral-800 bg-neutral-950 p-3 sm:p-3.5"
            >
              <div className="aspect-[16/5] sm:aspect-[16/4] w-full animate-pulse rounded-sm bg-neutral-900" />
              <div className="mt-3 sm:mt-3.5 flex items-center justify-between gap-3 sm:gap-4 px-0.5 sm:px-1">
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="h-4 w-32 animate-pulse rounded-sm bg-neutral-900" />
                  <div className="h-3 w-44 max-w-full animate-pulse rounded-sm bg-neutral-900" />
                </div>
                <div className="h-8 w-24 shrink-0 animate-pulse rounded-sm bg-neutral-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="mx-auto w-full pb-16">
        <Empty
          icon={Package}
          title="ยังไม่มีหมวดหมู่สินค้าในขณะนี้"
          description="ขณะนี้ยังไม่มีรายการหมวดหมู่สินค้าที่เปิดจำหน่าย กรุณากลับมาตรวจสอบใหม่อีกครั้งเร็วๆ นี้"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full pb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            id={category.id}
            name={category.name}
            image={category.image}
            description="เลือกหมวดหมู่เพื่อดูเพิ่มเติม"
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryShop;
