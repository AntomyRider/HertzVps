export function formatBytes(bytes: number, decimals: number = 1): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatUptime(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds < 0) return "0 วินาที";
  const days = Math.floor(totalSeconds / (3600 * 24));
  const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} วัน`);
  if (hours > 0) parts.push(`${hours} ชม.`);
  if (minutes > 0) parts.push(`${minutes} นาที`);
  if (parts.length === 0 || (days === 0 && hours === 0)) parts.push(`${seconds} วินาที`);

  return parts.join(" ");
}

export function getStatusColor(percent: number): {
  text: string;
  bg: string;
  border: string;
  bar: string;
  badge: string;
} {
  if (percent >= 85) {
    return {
      text: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      bar: "bg-red-500",
      badge: "border-red-500/20 bg-red-500/10 text-red-400",
    };
  }
  if (percent >= 65) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      bar: "bg-amber-500",
      badge: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    };
  }
  return {
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
    badge: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
  };
}
