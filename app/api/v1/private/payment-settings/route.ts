import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    let setting = await prisma.paymentSetting.findFirst();

    if (!setting) {
      setting = await prisma.paymentSetting.create({
        data: {
          truemoneyEnabled: true,
          truemoneyPhone: "",
          bankEnabled: false,
          bankName: "",
          bankAccountName: "",
          bankAccountNumber: "",
        },
      });
    }

    return NextResponse.json({ setting });
  } catch (error) {
    console.error("Fetch payment setting error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการดึงการตั้งค่าชำระเงิน" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const {
      truemoneyPhone,
      truemoneyEnabled,
      bankEnabled,
      bankName,
      bankAccountName,
      bankAccountNumber,
    } = await req.json();

    const dataToUpdate: any = {};
    if (typeof truemoneyPhone === "string") {
      dataToUpdate.truemoneyPhone = truemoneyPhone.trim();
    }
    if (typeof truemoneyEnabled === "boolean") {
      dataToUpdate.truemoneyEnabled = truemoneyEnabled;
    }
    if (typeof bankEnabled === "boolean") {
      dataToUpdate.bankEnabled = bankEnabled;
    }
    if (typeof bankName === "string") {
      dataToUpdate.bankName = bankName.trim();
    }
    if (typeof bankAccountName === "string") {
      dataToUpdate.bankAccountName = bankAccountName.trim();
    }
    if (typeof bankAccountNumber === "string") {
      dataToUpdate.bankAccountNumber = bankAccountNumber.trim();
    }

    let setting = await prisma.paymentSetting.findFirst();

    if (setting) {
      setting = await prisma.paymentSetting.update({
        where: { id: setting.id },
        data: dataToUpdate,
      });
    } else {
      setting = await prisma.paymentSetting.create({
        data: {
          truemoneyPhone: dataToUpdate.truemoneyPhone || "",
          truemoneyEnabled: dataToUpdate.truemoneyEnabled ?? true,
          bankEnabled: dataToUpdate.bankEnabled ?? false,
          bankName: dataToUpdate.bankName || "",
          bankAccountName: dataToUpdate.bankAccountName || "",
          bankAccountNumber: dataToUpdate.bankAccountNumber || "",
        },
      });
    }

    return NextResponse.json({
      success: true,
      setting,
      message: "บันทึกการตั้งค่าการเงินเรียบร้อยแล้ว",
    });
  } catch (error) {
    console.error("Update payment setting error:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกการตั้งค่าการเงิน" },
      { status: 500 }
    );
  }
}
