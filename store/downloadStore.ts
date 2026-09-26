import { create } from "zustand";
import axios from "axios";

export interface ReleaseAsset {
  id: string;
  name: string;
  size: number;
  downloadCount: number;
  downloadUrl: string;
  updatedAt: string;
}

export interface ReleaseItem {
  id: string;
  tagName: string;
  name: string;
  body: string;
  prerelease: boolean;
  publishedAt: string;
  assets: ReleaseAsset[];
}

interface DownloadState {
  releases: ReleaseItem[];
  isLoading: boolean;
  error: string | null;
  selectedRelease: ReleaseItem | null;

  setSelectedRelease: (release: ReleaseItem | null) => void;
  fetchReleases: () => Promise<void>;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  releases: [],
  isLoading: false,
  error: null,
  selectedRelease: null,

  setSelectedRelease: (release) => set({ selectedRelease: release }),

  fetchReleases: async () => {
    set({ isLoading: true, error: null });
    try {
      const {
        data: { releases },
      } = await axios.get<{ releases: ReleaseItem[] }>(
        "/api/v1/public/releases"
      );

      set({
        releases,
        selectedRelease: releases.length > 0 ? releases[0] : null,
        isLoading: false,
      });
    } catch (err: any) {
      set({
        error:
          err.response?.data?.error ||
          "ไม่สามารถดึงข้อมูลเวอร์ชันดาวน์โหลดได้",
        isLoading: false,
      });
    }
  },
}));
