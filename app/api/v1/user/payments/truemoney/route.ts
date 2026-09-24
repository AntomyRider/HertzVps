import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

function extractVoucherHash(input: string): string | null {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/[?&]v=([a-zA-Z0-9]+)/);
  const code = urlMatch ? urlMatch[1] : trimmed;

  // รหัสซองอั่งเปาของ TrueMoney ต้องมีความยาว 35 ตัวอักษรอย่างแม่นยำ
  if (/^[a-zA-Z0-9]{35}$/.test(code)) {
    return code;
  }
  return null;
}

const TRUEMONEY_ERROR_MESSAGES: Record<string, string> = {
  VOUCHER_OUT_OF_STOCK: "ซองของขวัญนี้ถูกรับไปหมดแล้ว หรือหมดอายุการใช้งานแล้ว",
  VOUCHER_NOT_FOUND: "ไม่พบซองของขวัญนี้ หรือรหัสซองไม่ถูกต้อง",
  INVAILD_VOUCHER: "รหัสซองของขวัญไม่ถูกต้อง",
  VOUCHER_EXPIRED: "ซองของขวัญนี้หมดอายุการใช้งานแล้ว",
  CANNOT_GET_OWN_VOUCHER: "เบอร์ผู้ส่งซองและเบอร์ผู้รับเป็นเบอร์เดียวกัน ไม่สามารถรับซองได้",
  TARGET_USER_NOT_FOUND: "ไม่พบบัญชี TrueMoney ของเบอร์โทรศัพท์ผู้รับ",
  INVAILD_PHONE: "เบอร์โทรศัพท์ผู้รับไม่ถูกต้อง",
  INTERNAL_ERROR: "ระบบ TrueMoney ขัดข้องชั่วคราว กรุณาลองใหม่อีกครั้ง",
};

interface RedeemResult {
  success: boolean;
  amount?: number;
  senderName?: string | null;
  error?: string;
}

async function redeemVoucher(phone: string, voucherHash: string): Promise<RedeemResult> {
  // 1. กลไกหลัก (Primary): เรียกผ่าน Proxy Service เพื่อป้องกันการโดน Cloudflare บล็อกบน Server/VPS
  try {
    const { data: proxyData } = await axios.post(
      "https://truewalletproxy-755211536068837409.rcf2.deploys.app/api",
      {
        mobile: phone,
        voucher: voucherHash,
      },
      {
        headers: {
          "content-type": "application/json",
          "user-agent": "multilabxxxxxxxx",
        },
        timeout: 10000,
      }
    );

    if (proxyData?.status?.code === "SUCCESS" && proxyData?.data?.my_ticket) {
      const amountBahtStr = String(proxyData.data.my_ticket.amount_baht).replace(/,/g, "");
      const amount = parseFloat(amountBahtStr);
      const senderName = proxyData.data.owner_profile?.full_name || null;
      if (!isNaN(amount) && amount > 0) {
        return { success: true, amount, senderName };
      }
    }

    if (proxyData?.status?.code && proxyData.status.code !== "SUCCESS") {
      const { code, message } = proxyData.status;
      const msg =
        TRUEMONEY_ERROR_MESSAGES[code] ||
        message ||
        "แลกรับซองของขวัญไม่สำเร็จ";
      return { success: false, error: msg };
    }
  } catch (proxyErr: any) {
    if (proxyErr.response?.data?.status?.code) {
      const { code, message } = proxyErr.response.data.status;
      const msg =
        TRUEMONEY_ERROR_MESSAGES[code] ||
        message ||
        "แลกรับซองของขวัญไม่สำเร็จ";
      return { success: false, error: msg };
    }
    console.warn(
      "TrueMoney proxy service unavailable or timed out, switching to direct fallback:",
      proxyErr.message
    );
  }

  // 2. กลไกสำรอง (Fallback): เรียก Endpoint ตรงของ TrueMoney (/campaign/vouchers/{code}/redeem)
  try {
    const { data: directData } = await axios.post(
      `https://gift.truemoney.com/campaign/vouchers/${voucherHash}/redeem`,
      {
        mobile: phone,
        voucher_hash: voucherHash,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "okhttp/4.9.0",
        },
        timeout: 10000,
      }
    );

    if (directData?.status?.code === "SUCCESS" && directData?.data?.my_ticket) {
      const amountBahtStr = String(directData.data.my_ticket.amount_baht).replace(/,/g, "");
      const amount = parseFloat(amountBahtStr);
      const senderName = directData.data.owner_profile?.full_name || null;
      if (!isNaN(amount) && amount > 0) {
        return { success: true, amount, senderName };
      }
    }

    const code = directData?.status?.code || "";
    const msg =
      TRUEMONEY_ERROR_MESSAGES[code] ||
      directData?.status?.message ||
      "แลกรับซองของขวัญไม่สำเร็จ";
    return { success: false, error: msg };
  } catch (directErr: any) {
    if (directErr.response?.data?.status?.code) {
      const { code, message } = directErr.response.data.status;
      const msg =
        TRUEMONEY_ERROR_MESSAGES[code] ||
        message ||
        "แลกรับซองของขวัญไม่สำเร็จ";
      return { success: false, error: msg };
    }

    console.error("Direct TrueMoney API error:", directErr.message);
    return {
      success: false,
      error: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ TrueMoney ได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
    };
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบก่อนทำรายการเติมเงิน" },
      { status: 401 }
    );
  }

  const { id: userId } = user;

  try {
    const { voucherUrl } = await req.json();

    if (!voucherUrl || typeof voucherUrl !== "string") {
      return NextResponse.json(
        { error: "กรุณาระบุลิงก์ซองของขวัญ TrueMoney" },
        { status: 400 }
      );
    }

    const voucherHash = extractVoucherHash(voucherUrl);
    if (!voucherHash) {
      return NextResponse.json(
        {
          error:
            "รหัสซองอั่งเปาต้องมีความยาว 35 ตัวอักษร (กรุณาตรวจสอบลิงก์ซองของขวัญอีกครั้ง)",
        },
        { status: 400 }
      );
    }

    // Check if this voucher has already been redeemed in our system
    const existingPayment = await prisma.payment.findFirst({
      where: {
        voucherCode: voucherHash,
        status: "SUCCESS",
      },
    });

    if (existingPayment) {
      return NextResponse.json(
        { error: "ซองของขวัญนี้ถูกใช้งานในระบบไปแล้ว" },
        { status: 400 }
      );
    }

    // Retrieve TrueMoney receiver phone number from PaymentSetting
    const setting = await prisma.paymentSetting.findFirst();
    if (!setting || !setting.truemoneyEnabled || !setting.truemoneyPhone) {
      return NextResponse.json(
        {
          error:
            "ระบบ TrueMoney ยังไม่ได้เปิดใช้งานหรือยังไม่ได้ตั้งค่าเบอร์โทรศัพท์ผู้รับ กรุณาติดต่อแอดมิน",
        },
        { status: 400 }
      );
    }

    const { truemoneyPhone } = setting;
    const cleanPhone = truemoneyPhone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      return NextResponse.json(
        { error: "เบอร์โทรศัพท์ผู้รับในระบบไม่ถูกต้อง กรุณาติดต่อแอดมิน" },
        { status: 400 }
      );
    }

    // Redeem TrueMoney voucher via Proxy (Primary) or Direct Endpoint (Fallback)
    const {
      success: redeemSuccess,
      amount: redeemedAmount,
      senderName: redeemedSenderName,
      error: redeemError,
    } = await redeemVoucher(cleanPhone, voucherHash);

    if (!redeemSuccess || !redeemedAmount) {
      return NextResponse.json(
        { error: redeemError || "แลกรับซองของขวัญไม่สำเร็จ" },
        { status: 400 }
      );
    }

    const amount = redeemedAmount;
    const senderName = redeemedSenderName || null;

    // Atomically credit user balance and log payment record
    const { updatedUser, payment } = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: {
            increment: amount,
          },
        },
        select: {
          id: true,
          balance: true,
        },
      });

      const payment = await tx.payment.create({
        data: {
          userId,
          amount,
          method: "TRUEMONEY",
          status: "SUCCESS",
          voucherCode: voucherHash,
          senderName,
          note: `เติมเงินผ่านซองของขวัญ TrueMoney สำเร็จ (ผู้ส่ง: ${senderName || "ไม่ระบุ"})`,
        },
        select: {
          id: true,
          amount: true,
          method: true,
          status: true,
          voucherCode: true,
          senderName: true,
          createdAt: true,
        },
      });

      return { updatedUser, payment };
    });

    return NextResponse.json({
      success: true,
      amount,
      senderName,
      newBalance: Number(updatedUser.balance),
      payment: {
        ...payment,
        amount: Number(payment.amount),
        createdAt: payment.createdAt.toISOString(),
      },
      message: `เติมเงินสำเร็จจำนวน ฿${amount.toLocaleString("th-TH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} เรียบร้อยแล้ว`,
    });
  } catch (error) {
    console.error("TrueMoney redeem exception:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการประมวลผลการเติมเงิน" },
      { status: 500 }
    );
  }
}
