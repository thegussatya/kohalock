const { PrismaClient } = require('./generated/prisma');
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  console.log('Users deleted');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
