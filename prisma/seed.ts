import 'dotenv/config'
import { createPrismaClient } from '../lib/create-prisma-client'

// Seed 必须拥有独立生命周期，避免部署脚本退出时遗留应用级连接池。
const prisma = createPrismaClient()

async function main(){
  await prisma.category.createMany({
    data: [
      {
        name: 'code',
        label: '代码',
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

  await prisma.category.createMany({
    data: [
      {
        name: 'css',
        label: "CSS",
        order: 0,
        parentId: 1,
      },
      {
        name: "js",
        label: 'JS',
        order: 1,
        parentId: 1,
      },
      {
        name: "html",
        label: 'HTML',
        order: 2,
        parentId: 1,
      },
      {
        name: "electron",
        label: 'electron',
        order: 3,
        parentId: 1,
      },
      {
        name: "bundler",
        label: '打包工具',
        order: 4,
        parentId: 1
      }
    ],
    // 每次部署都会重跑 seed，需保持幂等，避免二次部署时唯一约束冲突(P2002)。
    skipDuplicates: true
  })

  await prisma.category.createMany({
    data: [
      {
        name: "note",
        label: '散文随笔',
        order: 0,
        parentId: 2,
      },
      {
        name: "story",
        label: '小故事',
        order: 1,
        parentId: 2,
      },
      {
        name: "reflection",
        label: '启示录',
        order: 2,
        parentId: 2,
      },
    ],
    // 保持幂等：重复部署时跳过已存在的分类。
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
      },
      {
        name: 'vite',
        label: 'vite',
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
              categoryId: 3
            },
            {
              title: '这是 seed 生成的欢迎文章',
              content: '欢迎来到 毛毛 的blog',
              describe: '默认文章',
              status: "OFFICIAL",
              categoryId: 8
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
    console.log('seeds run success!')
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })