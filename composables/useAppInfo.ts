import { getCategories, getTags } from "~/api";

function useAppInfoShared () {
  const { data: tags } = getCategories();
  const { data: categories } = getTags();

  return {
    tags,
    categories,
  }
}

export const useAppInfo: (...args: any[]) => ReturnType<typeof useAppInfoShared> = createSharedComposable(useAppInfoShared);