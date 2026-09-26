import { NextResponse } from "next/server";
import axios from "axios";

interface GitHubAsset {
  id: number;
  name: string;
  size: number;
  download_count: number;
  browser_download_url: string;
  content_type: string;
  updated_at: string;
}

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string | null;
  prerelease: boolean;
  published_at: string;
  created_at: string;
  assets: GitHubAsset[];
}

export async function GET() {
  try {
    const { data: rawReleases } = await axios.get<GitHubRelease[]>(
      "https://api.github.com/repos/AntomyRider/HertzApk/releases",
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "hertz-server",
        },
        timeout: 10000,
      }
    );

    const releases = rawReleases.map(
      ({
        id,
        tag_name: tagName,
        name,
        body,
        prerelease,
        published_at: publishedAt,
        created_at: createdAt,
        assets,
      }) => {
        const exeAssets = (assets || [])
          .filter(({ name: assetName }) =>
            assetName.toLowerCase().endsWith(".exe")
          )
          .map(
            ({
              id: assetId,
              name: assetName,
              size,
              download_count: downloadCount,
              updated_at: updatedAt,
            }) => ({
              id: String(assetId),
              name: assetName,
              size,
              downloadCount,
              downloadUrl: `/api/v1/public/releases/download?assetId=${assetId}&tag=${encodeURIComponent(tagName)}`,
              updatedAt,
            })
          );

        return {
          id: String(id),
          tagName,
          name: name || tagName,
          body: body || "",
          prerelease,
          publishedAt: publishedAt || createdAt,
          assets: exeAssets,
        };
      }
    );

    return NextResponse.json({ releases });
  } catch (error: any) {
    console.error("Public Releases GET Error:", error?.message || error);
    return NextResponse.json(
      { error: "ไม่สามารถดึงข้อมูลเวอร์ชันดาวน์โหลดได้ในขณะนี้" },
      { status: 500 }
    );
  }
}
