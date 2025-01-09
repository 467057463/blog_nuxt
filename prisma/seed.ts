import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
// import prisma from "~/lib/prisma";

async function main(){
  await prisma.category.create({
    data: {
      name: 'css',
      label: 'css'
    }
  })

  await prisma.user.create({
    data: {
      username: 'admin',
      password: 'dev123456'
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })