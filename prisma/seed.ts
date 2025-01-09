import { PrismaClient } from '@prisma/client';
// import { hashPassword } from 'nuxt-auth-utils';
const prisma = new PrismaClient()

async function main(){
  await prisma.tag.create({
    data: {
      name: 'css',
      label: 'css'
    }
  })

  await prisma.user.create({
    data: {
      username: 'admin',
      password: "$scrypt$n=16384,r=8,p=1$c3qowH2SlqkuyaakmMMU8w$urlE1l+Kn5JCa+H+Bi1lHvHuHinQnJPmgw99nLC8UP6RaiqTlpydi+gOJcT1tgpm8e8i35qPy/UkiGj1618dxQ"
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