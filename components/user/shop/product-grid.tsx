"use client";

import { useState } from "react";
import Image from "next/image";
import { Package, ShoppingCart } from "lucide-react";
import { cn, isValidImageUrl } from "@/lib/utils";
import ButtonUI from "@/components/ui/button";
import FadeIn from "@/components/ui/fade-in";
import BuyDialog, { ShopProductItem } from "./buy-dialog";

interface CategoryProductGridProps {
  products: (ShopProductItem & { soldCount?: number })[];
  onProductUpdated?: () => void;
}

export const CategoryProductGrid = ({
  products,
  onProductUpdated,
}: CategoryProductGridProps) => {
  const [selectedProduct, setSelectedProduct] =
    useState<ShopProductItem | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {products.map((product, index) => {
          const stockCount = product.stock
            ? product.stock
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean).length
            : 0;
          const isAvailable = stockCount > 0;

          return (
            <FadeIn
              key={product.id}
              direction="up"
              delay={(index % 10) * 55}
              className="h-full"
            >
              <div className="flex h-full flex-col justify-between rounded-md border border-neutral-800 bg-neutral-950 p-2.5 sm:p-3.5 transition-colors hover:border-neutral-700 min-w-0">
                {/* Product Top: 1:1 Image + Name & Description */}
                <div className="min-w-0">
                  {/* 1:1 Aspect Ratio Thumbnail */}
                  <div className="relative mb-2.5 sm:mb-3 aspect-square w-full overflow-hidden rounded-sm border border-neutral-800/80 bg-neutral-900">
                    {isValidImageUrl(product.image) ? (
                      <Image
                        src={product.image!}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized={product.image!.startsWith("http")}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-neutral-600">
                        <Package size={28} />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <h3 className="truncate text-xs sm:text-sm md:text-base font-semibold text-white">
                    {product.name}
                  </h3>
                </div>

                {/* Product Bottom: Stock, Price & Buy Button */}
                <div className="mt-2.5 sm:mt-4 space-y-2 sm:space-y-3 border-neutral-900">
                  {/* Stock & Sold Count Badges */}
                  <div className="flex items-center justify-between gap-1 text-xs">
                    {/* ราคา */}
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] sm:text-xs text-neutral-500">
                        ราคา
                      </span>
                      <span className="truncate text-xs sm:text-sm md:text-base font-bold text-blue-500">
                        ฿
                        {Number(product.price).toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>

                    {/* คงเหลือ */}
                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-[10px] sm:text-xs text-neutral-500">
                        คงเหลือ
                      </span>
                      <span
                        className={cn(
                          "text-xs sm:text-sm md:text-base font-bold",
                          isAvailable ? "text-white" : "text-red-400"
                        )}
                      >
                        {isAvailable ? `${stockCount} ชิ้น` : "หมด"}
                      </span>
                    </div>
                  </div>

                  {/* Price and Buy Button */}
                  <div className="flex items-center justify-center gap-2">
                    <ButtonUI
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedProduct(product)}
                      className="flex items-center gap-1.5 rounded-sm bg-blue-600 py-1.5 sm:py-2 text-xs justify-center text-white transition hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed w-full"
                    >
                      <ShoppingCart size={13} />
                      <span>{isAvailable ? "สั่งซื้อ" : "หมด"}</span>
                    </ButtonUI>
                  </div>
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Buy Modal Dialog */}
      <BuyDialog
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onSuccess={() => {
          onProductUpdated?.();
        }}
      />
    </>
  );
};

export default CategoryProductGrid;
