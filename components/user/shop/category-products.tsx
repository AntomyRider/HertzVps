"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Package } from "lucide-react";
import BackUI from "@/components/ui/back";
import Empty from "@/components/ui/empty";
import FadeIn from "@/components/ui/fade-in";
import { useCategoryStore } from "@/store/categoryStore";
import CategoryProductGrid from "./product-grid";
import { isValidImageUrl } from "@/lib/utils";

interface CategoryProductsProps {
  categoryId: string;
}

const CategoryProducts = ({ categoryId }: CategoryProductsProps) => {
  const { currentCategory, isLoading, fetchCategoryDetail } =
    useCategoryStore();

  useEffect(() => {
    fetchCategoryDetail(categoryId);
  }, [categoryId, fetchCategoryDetail]);

  if (isLoading) {
    return (
      <div className="mx-auto w-full pb-16 pt-6">
        {/* Back Link Skeleton */}
        <div className="mb-6 h-4 w-32 animate-pulse rounded-sm bg-neutral-900" />

        {/* Category Banner Skeleton */}
        <div className="mb-8 rounded-md border border-neutral-800 bg-neutral-950 p-4">
          <div className="aspect-[16/4] w-full animate-pulse rounded-sm bg-neutral-900 mb-4" />
          <div className="space-y-1.5">
            <div className="h-6 w-48 animate-pulse rounded-sm bg-neutral-900" />
            <div className="h-3 w-36 animate-pulse rounded-sm bg-neutral-900" />
          </div>
        </div>

        {/* Product Cards Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-neutral-800 bg-neutral-950 p-3.5 space-y-3"
            >
              <div className="aspect-square w-full animate-pulse rounded-sm bg-neutral-900" />
              <div className="h-4 w-3/4 animate-pulse rounded-sm bg-neutral-900" />
              <div className="h-3 w-1/2 animate-pulse rounded-sm bg-neutral-900" />
              <div className="mt-4 flex items-center justify-between pt-3 border-t border-neutral-900">
                <div className="h-5 w-16 animate-pulse rounded-sm bg-neutral-900" />
                <div className="h-8 w-20 animate-pulse rounded-sm bg-neutral-900" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentCategory) {
    return (
      <FadeIn direction="up" className="mx-auto w-full max-w-4xl py-12">
        <BackUI
          href="/shop"
          text="ย้อนกลับไปหน้าร้านค้า"
          className="mb-6"
        />
        <Empty
          icon={Package}
          title="ไม่พบหมวดหมู่สินค้านี้"
          description="หมวดหมู่ที่คุณกำลังค้นหาอาจถูกลบหรือไม่มีอยู่ในระบบ"
        />
      </FadeIn>
    );
  }

  return (
    <div className="mx-auto w-full pb-10 pt-5 sm:pt-10">
      {/* Back Button */}
      <FadeIn direction="right" className="mb-4 sm:mb-6">
        <BackUI
          href="/shop"
          text="ย้อนกลับไปหน้าร้านค้า"
        />
      </FadeIn>

      {/* Category Banner & Title */}
      <FadeIn direction="up" delay={60} className="mb-5 sm:mb-8 rounded-md bg-neutral-950">
        {isValidImageUrl(currentCategory.image) && (
          <div className="relative aspect-[16/5] sm:aspect-[16/4] w-full overflow-hidden rounded-sm bg-neutral-900">
            <Image
              src={currentCategory.image!}
              alt={currentCategory.name}
              fill
              className="object-cover"
              unoptimized={currentCategory.image!.startsWith("http")}
            />
          </div>
        )}
      </FadeIn>

      {/* Products Grid with Buy Interaction */}
      {!currentCategory.products || currentCategory.products.length === 0 ? (
        <FadeIn direction="up" delay={100}>
          <Empty
            icon={Package}
            title="ยังไม่มีสินค้าในหมวดหมู่นี้"
            description="ขณะนี้ยังไม่มีสินค้าที่เปิดจำหน่ายในหมวดหมู่นี้ กรุณาตรวจสอบใหม่อีกครั้งเร็วๆ นี้"
          />
        </FadeIn>
      ) : (
        <CategoryProductGrid
          products={currentCategory.products}
          onProductUpdated={() => fetchCategoryDetail(categoryId)}
        />
      )}
    </div>
  );
};

export default CategoryProducts;
