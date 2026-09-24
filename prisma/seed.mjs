import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 3306),
  user: process.env.DATABASE_USER || "root",
  password: process.env.DATABASE_PASSWORD || "",
  database: process.env.DATABASE_NAME || "hertz_db",
  connectionLimit: 2,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const rawAdminIds =
    process.env.ADMIN_DISCORD_ID || "1048215319409328189";
  const adminIds = rawAdminIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  const defaultAdminName = process.env.ADMIN_NAME || "nutx";

  for (const discordId of adminIds) {
    const adminUser = await prisma.user.upsert({
      where: { discordId },
      update: {
        role: "ADMIN",
      },
      create: {
        discordId,
        name: defaultAdminName,
        avatar: "https://cdn.discordapp.com/embed/avatars/4.png",
        role: "ADMIN",
        balance: 0,
      },
    });
    console.log(
      `[Seed] Admin user ready: ${adminUser.name} (Discord ID: ${adminUser.discordId}, Role: ${adminUser.role})`
    );
  }

  // Ensure default PaymentSetting exists
  const paymentSettingCount = await prisma.paymentSetting.count();
  if (paymentSettingCount === 0) {
    await prisma.paymentSetting.create({
      data: {
        truemoneyEnabled: true,
        bankEnabled: false,
      },
    });
    console.log("[Seed] Created default PaymentSetting record.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    process.exit(0);
  })
  .catch(async (err) => {
    console.error("[Seed] Error seeding database:", err);
    await prisma.$disconnect();
    process.exit(1);
  });
