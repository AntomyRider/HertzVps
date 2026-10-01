/**
 * Seed key ของ desktop app เข้า local dev DB (MariaDB localhost:hertz_server)
 * ใช้ตอนรัน hertz-server แบบ dev ให้ /controller รับ sync จากแอปจริงได้
 *
 * ใช้: node scripts/seed-local-key.js <CODE> <HWID>
 */
const fs = require("fs");
const path = require("path");
const mariadb = require("mariadb");

const env = {};
for (const line of fs
  .readFileSync(path.join(__dirname, "..", ".env"), "utf8")
  .split(/\r?\n/)) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
}

async function main() {
  const code = process.argv[2];
  const hwid = process.argv[3] || null;
  if (!code) {
    console.error("usage: node scripts/seed-local-key.js <CODE> [HWID]");
    process.exit(1);
  }

  const conn = await mariadb.createConnection({
    host: env.DATABASE_HOST || "localhost",
    port: Number(env.DATABASE_PORT || 3306),
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
  });

  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  await conn.query(
    `INSERT INTO \`Key\` (id, code, isActive, durationDays, hwid, activatedAt, expiresAt, createdAt, updatedAt)
     VALUES (?, ?, true, 365, ?, NOW(), ?, NOW(), NOW())
     ON DUPLICATE KEY UPDATE hwid = VALUES(hwid), isActive = true, expiresAt = VALUES(expiresAt), updatedAt = NOW()`,
    [`key_dev_${code.replace(/[^A-Z0-9]/gi, "_").slice(0, 40)}`, code, hwid, expiresAt]
  );

  const rows = await conn.query("SELECT code, hwid, isActive, expiresAt FROM `Key` WHERE code = ?", [
    code,
  ]);
  console.log("seeded:", JSON.stringify(rows[0]));
  await conn.end();
}

main().catch((err) => {
  console.error("seed failed:", err.message);
  process.exit(1);
});
