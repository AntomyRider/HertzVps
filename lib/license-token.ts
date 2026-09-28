import crypto from "node:crypto";

/**
 * License Token Signing (Ed25519)
 * ออก token ที่เซ็นด้วย private key เพื่อให้ Desktop App ตรวจสอบสิทธิ์แบบ offline ได้
 * โดยไม่ต้องเชื่อกับข้อมูล plaintext ในเครื่องผู้ใช้อีกต่อไป
 *
 * ตั้งค่า: ใส่ PKCS8 PEM ในไฟล์ .env เช่น
 *   LICENSE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMEE...\n-----END PRIVATE KEY-----"
 * สูญเสีย key นี้ = token ทั้งหมดใช้ไม่ได้ (ผู้ใช้แค่ต้องออนไลน์ยืนยันใหม่ ไม่มีข้อมูลสูญหาย)
 */

const OFFLINE_GRACE_SECONDS = 7 * 24 * 60 * 60; // 1 สัปดาห์ — ต้องออนไลน์ยืนยันอย่างน้อย 7 วันครั้ง

export interface LicenseTokenPayload {
  /** license key code */
  code: string;
  /** hwid ที่ผูกไว้ */
  hwid: string;
  /** เวลาที่ออก token (ISO) */
  iat: string;
  /** หมดอายุการยืนยัน — ต้องออนไลน์ใหม่ภายในเวลานี้ (ISO) */
  exp: string;
  /** วันหมดอายุของ license เอง จากฐานข้อมูล (ISO หรือ null = ไม่มีวันหมดอายุ) */
  lex: string | null;
}

function getPrivateKey(): crypto.KeyObject | null {
  const raw = process.env.LICENSE_PRIVATE_KEY;
  if (!raw) {
    console.warn("[license-token] LICENSE_PRIVATE_KEY is not configured — cannot issue license tokens");
    return null;
  }
  try {
    const pem = raw.replace(/\\n/g, "\n").trim();
    return crypto.createPrivateKey(pem);
  } catch (err) {
    console.error("[license-token] Invalid LICENSE_PRIVATE_KEY:", err);
    return null;
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url");
}

/**
 * ออก license token สำหรับ key/hwid ที่ผ่านการตรวจสอบแล้ว
 * @returns token รูปแบบ "<payloadB64>.<signatureB64>" หรือ null หากไม่มี private key
 */
export function signLicenseToken(params: {
  code: string;
  hwid: string;
  licenseExpiresAt: string | null;
}): string | null {
  const privateKey = getPrivateKey();
  if (!privateKey) return null;

  const now = new Date();
  const payload: LicenseTokenPayload = {
    code: params.code,
    hwid: params.hwid,
    iat: now.toISOString(),
    exp: new Date(now.getTime() + OFFLINE_GRACE_SECONDS * 1000).toISOString(),
    lex: params.licenseExpiresAt,
  };

  const payloadB64 = base64url(JSON.stringify(payload));
  const signature = crypto.sign(null, Buffer.from(payloadB64), privateKey);
  return `${payloadB64}.${signature.toString("base64url")}`;
}
