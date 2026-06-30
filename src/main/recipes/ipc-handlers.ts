import { ipcMain } from 'electron'
import { RECIPE_IPC, RecipeCreate, RecipeUpdate } from '../../shared/recipe'
import { getAllRecipes, getRecipesForUrl, createRecipe, updateRecipe, deleteRecipe, toggleRecipe } from './db'

export function registerRecipeHandlers() {
  ipcMain.handle(RECIPE_IPC.GET_ALL, () => {
    return getAllRecipes()
  })

  ipcMain.handle(RECIPE_IPC.GET_FOR_URL, (_e, url: string) => {
    return getRecipesForUrl(url)
  })

  ipcMain.handle(RECIPE_IPC.CREATE, (_e, data: RecipeCreate) => {
    return createRecipe(data)
  })

  ipcMain.handle(RECIPE_IPC.UPDATE, (_e, data: RecipeUpdate) => {
    return updateRecipe(data)
  })

  ipcMain.handle(RECIPE_IPC.DELETE, (_e, id: string) => {
    return deleteRecipe(id)
  })

  ipcMain.handle(RECIPE_IPC.TOGGLE, (_e, id: string) => {
    return toggleRecipe(id)
  })
}
