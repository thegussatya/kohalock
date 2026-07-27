const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  const roles = await prisma.user.findMany({ select: { role: true }, distinct: ['role'] });
  console.log('Roles in DB:');
  console.log(roles.map(r => r.role));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
