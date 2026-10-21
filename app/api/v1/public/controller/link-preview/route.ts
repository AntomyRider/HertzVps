import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function isPrivateIpOrHost(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (
    lower === "localhost" ||
    lower.endsWith(".localhost") ||
    lower.endsWith(".local") ||
    lower === "::1"
  ) {
    return true;
  }

  // IPv4 regex checks for private / loopback ranges
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = lower.match(ipv4Regex);
  if (match) {
    const [, a, b] = match.map(Number);
    if (a === 127) return true; // loopback
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 169 && b === 254) return true; // link-local
    if (a === 0) return true;
  }

  return false;
}

function extractMeta(html: string, property: string, nameFallback?: string): string {
  // e.g. <meta property="og:title" content="..." />
  const propRegex = new RegExp(
    `<meta[^>]*?(?:property|name)=["'](?:${property}${nameFallback ? `|${nameFallback}` : ""})["'][^>]*?content=["']([^"']*)["']`,
    "i"
  );
  const match1 = html.match(propRegex);
  if (match1 && match1[1]) return match1[1].trim();

  // Alternative ordering: <meta content="..." property="og:title" />
  const contentFirstRegex = new RegExp(
    `<meta[^>]*?content=["']([^"']*)["'][^>]*?(?:property|name)=["'](?:${property}${nameFallback ? `|${nameFallback}` : ""})["']`,
    "i"
  );
  const match2 = html.match(contentFirstRegex);
  if (match2 && match2[1]) return match2[1].trim();

  return "";
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUrl = searchParams.get("url") || "";

    if (!rawUrl || !/^https?:\/\/\S+$/i.test(rawUrl)) {
      return NextResponse.json(
        { success: false, error: "กรุณาระบุ URL ที่ขึ้นต้นด้วย http:// หรือ https://" },
        { status: 400 }
      );
    }

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(rawUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: "รูปแบบ URL ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (isPrivateIpOrHost(parsedUrl.hostname)) {
      return NextResponse.json(
        { success: false, error: "ไม่อนุญาตให้ดึงข้อมูลจาก IP ภายในเครือข่าย" },
        { status: 403 }
      );
    }

    const domain = parsedUrl.hostname.replace(/^www\./i, "");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    let html = "";
    try {
      const res = await fetch(parsedUrl.toString(), {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      });

      if (!res.ok) {
        return NextResponse.json({
          success: false,
          message: `เซิร์ฟเวอร์ปลายทางตอบกลับด้วยรหัส ${res.status}`,
          data: {
            title: domain,
            description: "",
            image: "",
            siteName: domain,
            domain,
            url: rawUrl,
          },
        });
      }

      // Read at most 128KB of HTML for performance and memory
      const reader = res.body?.getReader();
      if (reader) {
        const chunks: Uint8Array[] = [];
        let totalBytes = 0;
        const maxBytes = 128 * 1024;

        while (totalBytes < maxBytes) {
          const { done, value } = await reader.read();
          if (done || !value) break;
          chunks.push(value);
          totalBytes += value.length;
        }
        reader.cancel().catch(() => {});
        const decoder = new TextDecoder("utf-8");
        html = decoder.decode(Buffer.concat(chunks));
      }
    } catch {
      return NextResponse.json({
        success: false,
        message: "ไม่สามารถเชื่อมต่อไปยังเว็บไซต์เป้าหมายได้",
        data: {
          title: domain,
          description: "",
          image: "",
          siteName: domain,
          domain,
          url: rawUrl,
        },
      });
    } finally {
      clearTimeout(timeout);
    }

    let title = extractMeta(html, "og:title");
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim();
      }
    }
    if (!title) title = domain;

    const description =
      extractMeta(html, "og:description", "description") || "";
    let image = extractMeta(html, "og:image");
    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, parsedUrl.origin).toString();
      } catch {
        image = "";
      }
    }

    const siteName =
      extractMeta(html, "og:site_name") || domain;

    return NextResponse.json({
      success: true,
      data: {
        title,
        description,
        image,
        siteName,
        domain,
        url: rawUrl,
      },
    });
  } catch (err) {
    console.error("GET /api/v1/public/controller/link-preview error:", err);
    return NextResponse.json(
      { success: false, error: "เกิดข้อผิดพลาดในการดึงข้อมูลตัวอย่างลิงก์" },
      { status: 500 }
    );
  }
}
