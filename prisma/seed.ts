import { PrismaClient } from '@prisma/client';
// import { hashPassword } from 'nuxt-auth-utils';
const prisma = new PrismaClient()

async function main(){
  await prisma.category.createMany({
    data: [
      {
        name: 'code',
        label: '技术',
        order: 0,
      },
      {
        name: 'life',
        label: '随笔',
        order: 1
      }
    ],
    skipDuplicates: true
  })

  await prisma.tag.createMany({
    data: [
      {
        name: 'css',
        label: 'css',
        categoryId: 1
      },
      {
        name: 'electron',
        label: 'electron',
        categoryId: 1
      },
      {
        name: 'vue',
        label: 'vue',
        categoryId: 1
      },
      {
        name: 'react',
        label: 'react',
        categoryId: 1
      }
    ],
    skipDuplicates: true
  })

  await prisma.user.upsert({
    where: {
      username: 'admin'
    },
    update: {
      username: 'admin'
    },
    create: {
      username: 'admin',
      password: "$scrypt$n=16384,r=8,p=1$c3qowH2SlqkuyaakmMMU8w$urlE1l+Kn5JCa+H+Bi1lHvHuHinQnJPmgw99nLC8UP6RaiqTlpydi+gOJcT1tgpm8e8i35qPy/UkiGj1618dxQ",
      role: 'ADMIN',
      profile: {
        create: {
          name: 'mmisme',
          avatar: 'default_avatar',
          email: '467057463@qq.com',
          intro: '一个不会设计的前端开发',
          site: 'www.mmisme.cn',
          github: 'github.com/467057463',
          qq: '467057463'
        }
      },
      articles: {
        createMany: {
          data: [
            {
              title: '这是 seed 生成的欢迎文章',
              content: '欢迎来到 毛毛 的blog',
              describe: '默认文章',
              status: "OFFICIAL",
              categoryId: 1
            },
            {
              title: '这是 seed 生成的欢迎文章',
              content: '欢迎来到 毛毛 的blog',
              describe: '默认文章',
              status: "OFFICIAL",
              categoryId: 2
            }
          ]
        }
      }
    }
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
    console.log('sess run success!')
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })