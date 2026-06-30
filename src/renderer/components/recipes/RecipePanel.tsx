import { useState } from 'react'
import { Recipe, RecipeCreate } from '../../../shared/recipe'
import RecipeList from './RecipeList'
import RecipeEditor from './RecipeEditor'

interface Props {
  allRecipes: Recipe[]
  activeRecipes: Recipe[]
  currentUrl: string
  onCreateRecipe: (data: RecipeCreate) => void
  onToggleRecipe: (id: string) => void
  onDeleteRecipe: (id: string) => void
  onClose: () => void
}

export default function RecipePanel({
  allRecipes,
  activeRecipes,
  currentUrl,
  onCreateRecipe,
  onToggleRecipe,
  onDeleteRecipe,
  onClose,
}: Props) {
  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="recipe-panel">
      <div className="recipe-panel-header">
        <h2>Recipes</h2>
        <button className="recipe-panel-close" onClick={onClose}>×</button>
      </div>
      {isEditing ? (
        <RecipeEditor
          currentUrl={currentUrl}
          onSave={(data) => {
            onCreateRecipe(data)
            setIsEditing(false)
          }}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <RecipeList
          recipes={allRecipes}
          activeRecipes={activeRecipes}
          onToggle={onToggleRecipe}
          onDelete={onDeleteRecipe}
          onNew={() => setIsEditing(true)}
        />
      )}
    </div>
  )
}
