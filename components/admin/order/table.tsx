"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Eye,
  ShoppingBag,
  User as UserIcon,
  Package,
} from "lucide-react";
import Table, {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import Empty from "@/components/ui/empty";
import Pagination from "@/components/ui/pagination";
import { useOrderStore } from "@/store/orderStore";
import ToolsOrder from "./tools";
import DialogOrder from "./dialog";
import AdminOrderMobileCard from "./mobile/card";
import { isValidImageUrl } from "@/lib/utils";

const ITEMS_PER_PAGE = 10;

export const TableOrder = () => {
  const { orders, isLoading, search, fetchOrders, setViewingOrder } =
    useOrderStore();

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedOrders = orders.slice(
    (safePage - 1) * ITEMS_PER_PAGE,
    safePage * ITEMS_PER_PAGE
  );

  return (
    <div className="w-full space-y-4">
      {/* Header Tools */}
      <ToolsOrder />

      {/* Mobile Card View (md:hidden) */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-36 w-full animate-pulse rounded-md border border-neutral-800 bg-neutral-900/50"
            />
          ))
        ) : orders.length === 0 ? (
          <div className="rounded-md border border-neutral-800 bg-neutral-950 p-6">
            <Empty
              icon={ShoppingBag}
              title="ยังไม่มีรายการคำสั่งซื้อ"
              description={
                search
                  ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา"
                  : "คำสั่งซื้อจะปรากฏที่นี่เมื่อมีผู้ใช้สั่งซื้อสินค้าในระบบ"
              }
            />
          </div>
        ) : (
          paginatedOrders.map((order) => (
            <AdminOrderMobileCard
              key={order.id}
              order={order}
              onView={setViewingOrder}
            />
          ))
        )}
      </div>

      {/* Desktop Orders Table (hidden on mobile, visible on md+) */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ผู้สั่งซื้อ</TableHead>
              <TableHead>สินค้า</TableHead>
              <TableHead className="w-28 text-right">ยอดเงิน</TableHead>
              <TableHead className="w-48">สต็อกที่ส่งมอบ</TableHead>
              <TableHead className="w-40">วันที่สั่งซื้อ</TableHead>
              <TableHead className="w-20 text-center">ดูข้อมูล</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              // Skeleton Loading Rows
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-900" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-28 animate-pulse rounded bg-neutral-900" />
                        <div className="h-3 w-20 animate-pulse rounded bg-neutral-900" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 shrink-0 animate-pulse rounded-sm bg-neutral-900" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 animate-pulse rounded bg-neutral-900" />
                        <div className="h-3 w-16 animate-pulse rounded bg-neutral-900" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="ml-auto h-4 w-16 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-36 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell>
                    <div className="h-4 w-28 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="mx-auto h-8 w-8 animate-pulse rounded bg-neutral-900" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length === 0 ? (
              // Empty State
              <TableRow>
                <TableCell colSpan={6} className="p-6">
                  <Empty
                    icon={ShoppingBag}
                    title="ยังไม่มีรายการคำสั่งซื้อ"
                    description={
                      search
                        ? "ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไขการค้นหา"
                        : "คำสั่งซื้อจะปรากฏที่นี่เมื่อมีผู้ใช้สั่งซื้อสินค้าในระบบ"
                    }
                  />
                </TableCell>
              </TableRow>
            ) : (
              // Order Rows
              paginatedOrders.map((order) => (
                <TableRow key={order.id}>
                  {/* Buyer (Avatar + Name & Discord ID) */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-neutral-800 bg-neutral-900">
                        {isValidImageUrl(order.userAvatar) ? (
                          <Image
                            src={order.userAvatar!}
                            alt={order.userName}
                            fill
                            className="object-cover"
                            unoptimized={order.userAvatar!.startsWith("http")}
                          />
                        ) : (
                          <UserIcon size={16} className="text-neutral-500" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-white">
                          {order.userName}
                        </span>
                        <span className="truncate text-xs text-neutral-500">
                          ID: {order.userDiscordId}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Product (Thumbnail + Name) */}
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
                          <Package size={16} className="text-neutral-600" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-medium text-white">
                          {order.productName}
                        </span>
                        <span className="truncate text-[11px] text-neutral-500">
                          Order #{order.id.slice(-6)} • {order.quantity || 1} ชิ้น
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Price */}
                  <TableCell className="text-right">
                    <span className="text-sm font-semibold text-neutral-200">
                      ฿{Number(order.price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>

                  {/* Delivered Stock Preview */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => setViewingOrder(order)}
                      className="group flex max-w-[180px] items-center gap-1.5 truncate rounded-sm border border-neutral-800/80 bg-neutral-900/60 px-2 py-1 text-left text-xs text-blue-400/90 transition hover:border-blue-500/40 hover:text-blue-300"
                      title="คลิกเพื่อดูรายละเอียดสต็อกฉบับเต็ม"
                    >
                      <span className="truncate">{order.deliveredStock}</span>
                    </button>
                  </TableCell>

                  {/* Created At */}
                  <TableCell className="text-xs text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>

                  {/* Action View Detail */}
                  <TableCell className="text-center">
                    <button
                      type="button"
                      onClick={() => setViewingOrder(order)}
                      className="flex h-8 w-8 items-center justify-center rounded-sm border border-neutral-800 text-neutral-400 transition hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 mx-auto"
                      title="ดูรายละเอียดคำสั่งซื้อ"
                    >
                      <Eye size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (10 items per page) */}
      {!isLoading && orders.length > 0 && (
        <Pagination
          currentPage={safePage}
          totalItems={orders.length}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      )}

      {/* View Order Dialog */}
      <DialogOrder />
    </div>
  );
};

export default TableOrder;
