import { ipcMain, dialog } from 'electron'
import { RECIPE_IPC, RecipeCreate, RecipeUpdate } from '../../shared/recipe'
import { getAllRecipes, getRecipesForUrl, createRecipe, updateRecipe, deleteRecipe, toggleRecipe } from './db'
import fs from 'fs'

export function registerRecipeHandlers() {
  ipcMain.handle(RECIPE_IPC.GET_ALL, () => getAllRecipes())
  ipcMain.handle(RECIPE_IPC.GET_FOR_URL, (_e, url: string) => getRecipesForUrl(url))
  ipcMain.handle(RECIPE_IPC.CREATE, (_e, data: RecipeCreate) => createRecipe(data))
  ipcMain.handle(RECIPE_IPC.UPDATE, (_e, data: RecipeUpdate) => updateRecipe(data))
  ipcMain.handle(RECIPE_IPC.DELETE, (_e, id: string) => deleteRecipe(id))
  ipcMain.handle(RECIPE_IPC.TOGGLE, (_e, id: string) => toggleRecipe(id))

  ipcMain.handle(RECIPE_IPC.EXPORT, async () => {
    const recipes = getAllRecipes()
    const result = await dialog.showSaveDialog({
      title: 'Export Recipes',
      defaultPath: 'melt-recipes.json',
      filters: [{ name: 'JSON', extensions: ['json'] }],
    })
    if (!result.canceled && result.filePath) {
      const exportData = {
        version: 1,
        exportedAt: new Date().toISOString(),
        recipes: recipes.map(r => ({
          name: r.name, urlPattern: r.urlPattern,
          css: r.css, js: r.js, domActions: r.domActions,
        })),
      }
      fs.writeFileSync(result.filePath, JSON.stringify(exportData, null, 2))
      return { success: true, count: recipes.length }
    }
    return { success: false }
  })

  ipcMain.handle(RECIPE_IPC.IMPORT, async () => {
    const result = await dialog.showOpenDialog({
      title: 'Import Recipes',
      filters: [{ name: 'JSON', extensions: ['json'] }],
      properties: ['openFile'],
    })
    if (!result.canceled && result.filePaths.length) {
      try {
        const data = JSON.parse(fs.readFileSync(result.filePaths[0], 'utf-8'))
        let imported = 0
        for (const r of data.recipes || []) {
          createRecipe({
            name: r.name || 'Imported Recipe',
            urlPattern: r.urlPattern || '*',
            css: r.css || '',
            js: r.js || '',
            domActions: r.domActions || '[]',
            enabled: true as any,
          })
          imported++
        }
        return { success: true, count: imported }
      } catch (e: any) {
        return { success: false, error: e.message }
      }
    }
    return { success: false }
  })
}
