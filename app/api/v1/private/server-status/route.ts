import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import os from "node:os";
import fs from "node:fs";
import path from "node:path";

export const dynamic = "force-dynamic";

interface LinuxMemInfo {
  MemTotal?: number;
  MemFree?: number;
  MemAvailable?: number;
  Buffers?: number;
  Cached?: number;
  SwapTotal?: number;
  SwapFree?: number;
  SwapCached?: number;
}

function parseProcMeminfo(): LinuxMemInfo | null {
  try {
    if (!fs.existsSync("/proc/meminfo")) return null;
    const content = fs.readFileSync("/proc/meminfo", "utf-8");
    const meminfo: LinuxMemInfo = {};
    for (const line of content.split("\n")) {
      const match = line.match(/^([A-Za-z0-9_]+):\s+(\d+)\s+kB/);
      if (match) {
        const key = match[1] as keyof LinuxMemInfo;
        const val = parseInt(match[2], 10);
        meminfo[key] = val * 1024; // Convert kB to bytes
      }
    }
    return meminfo;
  } catch {
    return null;
  }
}

interface OsReleaseInfo {
  prettyName: string;
  name: string;
  version: string;
  id: string;
  codename?: string;
}

function parseOsRelease(): OsReleaseInfo {
  try {
    const osReleasePath = fs.existsSync("/etc/os-release")
      ? "/etc/os-release"
      : fs.existsSync("/usr/lib/os-release")
      ? "/usr/lib/os-release"
      : null;

    if (osReleasePath) {
      const content = fs.readFileSync(osReleasePath, "utf-8");
      const data: Record<string, string> = {};
      for (const line of content.split("\n")) {
        const [k, ...v] = line.split("=");
        if (k && v.length > 0) {
          data[k.trim()] = v.join("=").replace(/^["']|["']$/g, "").trim();
        }
      }
      return {
        prettyName: data.PRETTY_NAME || data.NAME || "Linux",
        name: data.NAME || "Ubuntu",
        version: data.VERSION || data.VERSION_ID || "",
        id: data.ID || "ubuntu",
        codename: data.UBUNTU_CODENAME || data.VERSION_CODENAME || "",
      };
    }
  } catch {
    // fallback below
  }

  const platform = os.platform();
  const type = os.type();
  const release = os.release();
  return {
    prettyName: platform === "linux" ? `Linux Ubuntu (${release})` : `${type} ${release}`,
    name: platform === "linux" ? "Ubuntu" : type,
    version: release,
    id: platform,
  };
}

interface LinuxNetDev {
  interface: string;
  rxBytes: number;
  txBytes: number;
}

function parseProcNetDev(): LinuxNetDev[] {
  const result: LinuxNetDev[] = [];
  try {
    if (!fs.existsSync("/proc/net/dev")) return result;
    const content = fs.readFileSync("/proc/net/dev", "utf-8");
    const lines = content.split("\n");
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const colonIdx = line.indexOf(":");
      if (colonIdx === -1) continue;
      const iface = line.substring(0, colonIdx).trim();
      if (iface === "lo") continue; // Skip loopback

      const rest = line.substring(colonIdx + 1).trim().split(/\s+/);
      const rxBytes = parseInt(rest[0], 10) || 0;
      const txBytes = parseInt(rest[8], 10) || 0;
      result.push({ interface: iface, rxBytes, txBytes });
    }
  } catch {
    // ignore
  }
  return result;
}

async function getCpuMetrics() {
  const getCpuTicks = () => {
    return os.cpus().map((cpu) => {
      const total = Object.values(cpu.times).reduce((a, b) => a + b, 0);
      return { idle: cpu.times.idle, total };
    });
  };

  const startTicks = getCpuTicks();
  await new Promise((r) => setTimeout(r, 120));
  const endTicks = getCpuTicks();

  let totalIdle = 0;
  let totalTick = 0;
  const perCoreUsage: number[] = [];

  for (let i = 0; i < startTicks.length; i++) {
    const idleDiff = endTicks[i].idle - startTicks[i].idle;
    const totalDiff = endTicks[i].total - startTicks[i].total;
    const corePercent =
      totalDiff > 0
        ? Math.max(0, Math.min(100, Math.round(((totalDiff - idleDiff) / totalDiff) * 100)))
        : 0;
    perCoreUsage.push(corePercent);
    totalIdle += idleDiff;
    totalTick += totalDiff;
  }

  const overallPercent =
    totalTick > 0
      ? Math.max(0, Math.min(100, Math.round(((totalTick - totalIdle) / totalTick) * 100)))
      : 0;

  const cpus = os.cpus();
  const model = cpus[0]?.model || "Generic CPU";
  const speed = cpus[0]?.speed || 0;
  const loadAvg = os.loadavg(); // [1m, 5m, 15m]

  return {
    usagePercent: overallPercent,
    cores: cpus.length,
    model,
    speedMhz: speed,
    loadAvg: [
      Number(loadAvg[0].toFixed(2)),
      Number(loadAvg[1].toFixed(2)),
      Number(loadAvg[2].toFixed(2)),
    ],
    perCoreUsage,
  };
}

export async function GET() {
  const { authorized, error, status } = await requireAdmin();
  if (!authorized) {
    return NextResponse.json({ error }, { status });
  }

  try {
    // 1. OS & System Info
    const { prettyName, name: distro, version: distroVersion, codename } = parseOsRelease();
    const system = {
      osName: prettyName,
      distro,
      distroVersion,
      codename,
      kernel: os.release(),
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch(),
      uptimeSeconds: Math.floor(os.uptime()),
    };

    // 2. CPU Metrics
    const cpu = await getCpuMetrics();

    // 3. Memory & Swap Metrics
    const meminfo = parseProcMeminfo();
    let totalRam: number;
    let freeRam: number;
    let usedRam: number;
    let availableRam: number;
    let buffersCache = 0;
    let totalSwap = 0;
    let freeSwap = 0;
    let usedSwap = 0;

    if (meminfo && meminfo.MemTotal) {
      const { MemTotal, MemAvailable, MemFree, Buffers, Cached, SwapTotal, SwapFree } = meminfo;
      totalRam = MemTotal;
      availableRam = MemAvailable ?? (MemFree || 0) + (Buffers || 0) + (Cached || 0);
      freeRam = MemFree ?? 0;
      usedRam = Math.max(0, totalRam - availableRam);
      buffersCache = (Buffers || 0) + (Cached || 0);

      totalSwap = SwapTotal || 0;
      freeSwap = SwapFree || 0;
      usedSwap = Math.max(0, totalSwap - freeSwap);
    } else {
      totalRam = os.totalmem();
      freeRam = os.freemem();
      availableRam = freeRam;
      usedRam = totalRam - freeRam;
    }

    const ramUsagePercent = totalRam > 0 ? Math.round((usedRam / totalRam) * 100) : 0;
    const swapUsagePercent = totalSwap > 0 ? Math.round((usedSwap / totalSwap) * 100) : 0;

    const memory = {
      totalBytes: totalRam,
      usedBytes: usedRam,
      freeBytes: freeRam,
      availableBytes: availableRam,
      buffersCacheBytes: buffersCache,
      usagePercent: ramUsagePercent,
      swap: {
        totalBytes: totalSwap,
        usedBytes: usedSwap,
        freeBytes: freeSwap,
        usagePercent: swapUsagePercent,
      },
    };

    // 4. Storage / Disk Metrics
    let disk = {
      mount: "/",
      totalBytes: 0,
      usedBytes: 0,
      freeBytes: 0,
      usagePercent: 0,
      isAvailable: false,
    };

    try {
      let targetPath = "/";
      if (process.platform === "win32") {
        targetPath = process.cwd().split(path.sep)[0] + path.sep;
      }
      const { bsize, blocks, bavail } = fs.statfsSync(targetPath);
      const totalDisk = bsize * blocks;
      const freeDisk = bsize * bavail;
      const usedDisk = Math.max(0, totalDisk - freeDisk);
      const usagePercent = totalDisk > 0 ? Math.round((usedDisk / totalDisk) * 100) : 0;

      disk = {
        mount: targetPath,
        totalBytes: totalDisk,
        usedBytes: usedDisk,
        freeBytes: freeDisk,
        usagePercent,
        isAvailable: true,
      };
    } catch {
      // Failed to read disk
    }

    // 5. Database (MariaDB) Status
    let dbStatus: "connected" | "error" = "connected";
    let dbLatencyMs = 0;
    let dbVersion = "MariaDB";
    try {
      const start = performance.now();
      await prisma.$queryRaw`SELECT 1`;
      dbLatencyMs = Math.round(performance.now() - start);

      const ver: any = await prisma.$queryRaw`SELECT VERSION() as version`;
      if (Array.isArray(ver) && ver[0]?.version) {
        dbVersion = String(ver[0].version);
      }
    } catch {
      dbStatus = "error";
    }

    const database = {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      version: dbVersion,
      engine: "MariaDB / MySQL",
    };

    // 6. Node.js Application Process
    const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
    const node = {
      version: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      pid: process.pid,
      memory: {
        rss,
        heapTotal,
        heapUsed,
        external,
      },
    };

    // 7. Network Interfaces
    const netDevs = parseProcNetDev();
    const ifaces = os.networkInterfaces();
    const networkInterfaces: Array<{
      name: string;
      ip: string;
      mac: string;
      rxBytes?: number;
      txBytes?: number;
    }> = [];

    for (const [name, addrs] of Object.entries(ifaces)) {
      if (!addrs || name === "lo") continue;
      const ipv4 = addrs.find((a) => a.family === "IPv4" && !a.internal);
      if (ipv4) {
        const procStats = netDevs.find((n) => n.interface === name);
        networkInterfaces.push({
          name,
          ip: ipv4.address,
          mac: ipv4.mac,
          rxBytes: procStats?.rxBytes,
          txBytes: procStats?.txBytes,
        });
      }
    }

    const responsePayload = {
      system,
      cpu,
      memory,
      disk,
      database,
      node,
      network: {
        interfaces: networkInterfaces,
      },
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Error retrieving server status:", error);
    return NextResponse.json(
      { error: "Internal Server Error retrieving server status" },
      { status: 500 }
    );
  }
}
