"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Package, Eye, ShoppingBag, ExternalLink } from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import ButtonUI from "@/components/ui/button";
import { useOrderStore } from "@/store/orderStore";
import OrderModal from "./order-modal";
import UserOrderMobileCard from "./mobile/order-card";
import { isValidImageUrl } from "@/lib/utils";

export const OrderHistoryTable = () => {
  const {
    userOrders,
    isLoadingUserOrders,
    fetchUserOrders,
    setViewingUserOrder,
  } = useOrderStore();

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  if (!isLoadingUserOrders && userOrders.length === 0) {
    return (
      <div className="py-12">
        <Empty
          icon={ShoppingBag}
          title="ยังไม่มีประวัติการสั่งซื้อ"
          description="คุณยังไม่เคยทำการสั่งซื้อสินค้าในระบบ สามารถเลือกดูสินค้าที่สนใจได้เลย"
          action={
            <ButtonUI
              href="/shop"
              className="inline-flex items-center gap-2 rounded-sm bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <span>เลือกซื้อสินค้า</span>
              <ExternalLink size={13} />
            </ButtonUI>
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-3 sm:gap-3.5 md:hidden">
        {isLoadingUserOrders ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-28 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : (
          userOrders.map((order) => (
            <UserOrderMobileCard
              key={order.id}
              order={order}
              onViewDetail={setViewingUserOrder}
            />
          ))
        )}
      </div>

      {/* Desktop Table View (hidden on mobile, visible on md+) */}
      <div className="hidden md:block">
        <Table wrapperClassName="rounded-md border border-neutral-800">
          <TableHeader>
            <TableRow>
              <TableHead>สินค้า</TableHead>
              <TableHead className="w-24 text-center">จำนวน</TableHead>
              <TableHead className="w-36">วันที่สั่งซื้อ</TableHead>
              <TableHead className="w-28 text-right">ยอดเงิน</TableHead>
              <TableHead className="w-32 text-center">ข้อมูลที่ได้รับ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoadingUserOrders ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-sm bg-neutral-900" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 animate-pulse rounded-sm bg-neutral-900" />
                        <div className="h-3 w-20 animate-pulse rounded-sm bg-neutral-900" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-5 w-12 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-3.5 w-24 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-3.5 w-16 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-7 w-20 animate-pulse rounded-sm bg-neutral-900" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              userOrders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString(
                  "th-TH",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                );

                return (
                  <TableRow
                    key={order.id}
                    className="transition hover:bg-neutral-900/40"
                  >
                    {/* Product */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900">
                          {isValidImageUrl(order.productImage) ? (
                            <Image
                              src={order.productImage!}
                              alt={order.productName}
                              fill
                              className="object-cover"
                              unoptimized={order.productImage!.startsWith("http")}
                            />
                          ) : (
                            <Package size={18} className="text-neutral-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold text-white">
                            {order.productName}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            #{order.id.slice(-8)}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Quantity */}
                    <TableCell className="text-center">
                      <span className="inline-flex items-center rounded-sm border border-neutral-800 bg-neutral-900/60 px-2 py-0.5 text-xs font-medium text-neutral-300">
                        x{order.quantity || 1} ชิ้น
                      </span>
                    </TableCell>

                    {/* Date */}
                    <TableCell className="text-xs text-neutral-400 whitespace-nowrap">
                      {formattedDate}
                    </TableCell>

                    {/* Price */}
                    <TableCell className="text-right">
                      <span className="text-xs font-semibold text-emerald-400">
                        ฿{order.price.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </TableCell>

                    {/* Delivered Stock Action */}
                    <TableCell className="text-center">
                      <button
                        type="button"
                        onClick={() => setViewingUserOrder(order)}
                        className="inline-flex items-center gap-1.5 rounded-sm border border-neutral-800 bg-neutral-900/80 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 cursor-pointer"
                      >
                        <Eye size={13} />
                        <span>ดูข้อมูล</span>
                      </button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal to display delivered stock */}
      <OrderModal />
    </div>
  );
};

export default OrderHistoryTable;
