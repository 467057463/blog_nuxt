
import { getCategories, getTags } from '~/api/idnex'
import type { CategoryData, TagData } from '~/api/idnex'

export const useAppStore = defineStore("app", () => {
  let categories = ref<CategoryData[]>([])
  // 获取分类
  async function fetchCategories(){
    try {
      const res = await getCategories()
      categories.value = res.data
    } catch (error) {
      console.error(error)
      categories.value = [
        {
          "id": 2,
          "name": "life"
        },
        {
          "id": 1,
          "name": "technology"
        }
      ]
    }
  }

  let tags = ref<TagData[]>([])
  // 获取标签
  async function fetchTags() {
    try {
      const res = await getTags()
      tags.value = res.data
    } catch (error) {
      console.error(error)
      tags.value = [
        {
          "id": 2,
          "name": "css"
      },
      {
          "id": 1,
          "name": "electron"
      },
      {
          "id": 3,
          "name": "javascript"
      }
      ]
    }
  }

  return {
    categories,
    fetchCategories,
    tags,
    fetchTags
  }
})