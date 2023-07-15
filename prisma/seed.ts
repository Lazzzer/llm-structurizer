import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();
async function main() {
  await prisma.application.upsert({
    where: { name: 'structurizer' },
    update: {},
    create: {
      name: 'structurizer',
      ApiKey: {
        create: {
          id: randomUUID(),
        },
      },
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
