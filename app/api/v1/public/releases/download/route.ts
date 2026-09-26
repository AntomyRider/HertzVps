import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

interface GitHubAssetDetail {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get("assetId");

    if (!assetId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสไฟล์สำหรับดาวน์โหลด" },
        { status: 400 }
      );
    }

    // 1. Fetch asset metadata from GitHub API
    const {
      data: { name: fileName, browser_download_url: downloadUrl },
    } = await axios.get<GitHubAssetDetail>(
      `https://api.github.com/repos/AntomyRider/HertzApk/releases/assets/${encodeURIComponent(assetId)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "hertz-server",
        },
        timeout: 10000,
      }
    );

    if (!fileName.toLowerCase().endsWith(".exe")) {
      return NextResponse.json(
        { error: "อนุญาตให้ดาวน์โหลดเฉพาะไฟล์ติดตั้ง (.exe) เท่านั้น" },
        { status: 403 }
      );
    }

    // 2. Stream binary .exe content through server so client never redirects to GitHub
    const { data: fileBuffer, headers: upstreamHeaders } = await axios.get(
      downloadUrl,
      {
        responseType: "arraybuffer",
        headers: {
          "User-Agent": "hertz-server",
        },
        timeout: 120000,
      }
    );

    const responseHeaders = new Headers({
      "Content-Type": String(
        upstreamHeaders["content-type"] || "application/octet-stream"
      ),
      "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
      "Cache-Control": "public, max-age=3600",
    });

    if (upstreamHeaders["content-length"]) {
      responseHeaders.set(
        "Content-Length",
        String(upstreamHeaders["content-length"])
      );
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error("Public EXE Download Proxy Error:", error?.message || error);
    return NextResponse.json(
      { error: "ไม่สามารถดาวน์โหลดไฟล์ .exe ได้ในขณะนี้" },
      { status: 500 }
    );
  }
}
