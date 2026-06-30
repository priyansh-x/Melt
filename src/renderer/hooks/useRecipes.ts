import { useState, useEffect, useCallback } from 'react'
import { Recipe, RecipeCreate } from '../../shared/recipe'

export function useRecipes(currentUrl: string) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([])
  const [activeRecipes, setActiveRecipes] = useState<Recipe[]>([])

  const refresh = useCallback(async () => {
    const all = await window.melt.recipes.getAll()
    setAllRecipes(all)
    if (currentUrl) {
      const active = await window.melt.recipes.getForUrl(currentUrl)
      setActiveRecipes(active)
    }
  }, [currentUrl])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createRecipe = useCallback(async (data: RecipeCreate) => {
    const recipe = await window.melt.recipes.create(data)
    await refresh()
    return recipe
  }, [refresh])

  const updateRecipe = useCallback(async (id: string, updates: Partial<RecipeCreate>) => {
    await window.melt.recipes.update({ id, ...updates })
    await refresh()
  }, [refresh])

  const deleteRecipe = useCallback(async (id: string) => {
    await window.melt.recipes.delete(id)
    await refresh()
  }, [refresh])

  const toggleRecipe = useCallback(async (id: string) => {
    await window.melt.recipes.toggle(id)
    await refresh()
  }, [refresh])

  return {
    allRecipes,
    activeRecipes,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    toggleRecipe,
    refresh,
  }
}
