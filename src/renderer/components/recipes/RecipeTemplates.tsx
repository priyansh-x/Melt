import { RECIPE_TEMPLATES, RecipeTemplate } from '../../data/templates'
import { RecipeCreate } from '../../../shared/recipe'

interface Props {
  onInstall: (data: RecipeCreate) => void
  installedNames: Set<string>
}

const CATEGORY_LABELS = {
  productivity: 'Productivity',
  privacy: 'Privacy',
  visual: 'Visual',
  accessibility: 'Accessibility',
}

const CATEGORY_COLORS = {
  productivity: '#3b82f6',
  privacy: '#22c55e',
  visual: '#a855f7',
  accessibility: '#f59e0b',
}

export default function RecipeTemplates({ onInstall, installedNames }: Props) {
  const grouped = new Map<string, RecipeTemplate[]>()
  for (const t of RECIPE_TEMPLATES) {
    if (!grouped.has(t.category)) grouped.set(t.category, [])
    grouped.get(t.category)!.push(t)
  }

  return (
    <div style={{ padding: '12px' }}>
      <div style={{ fontSize: 11, color: '#666', marginBottom: 12 }}>
        One-click recipes for common customizations
      </div>
      {Array.from(grouped.entries()).map(([category, templates]) => (
        <div key={category} style={{ marginBottom: 16 }}>
          <div style={{
            fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
            color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
            marginBottom: 6,
          }}>
            {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
          </div>
          {templates.map((t) => {
            const isInstalled = installedNames.has(t.recipe.name)
            return (
              <div key={t.id} className="recipe-item" style={{ marginBottom: 2 }}>
                <div className="recipe-info" style={{ gap: 2 }}>
                  <span className="recipe-name">{t.name}</span>
                  <span className="recipe-pattern" style={{ fontFamily: 'inherit' }}>{t.description}</span>
                </div>
                <button
                  className={`recipe-btn ${isInstalled ? 'secondary' : 'primary'}`}
                  style={{ fontSize: 10, padding: '3px 10px' }}
                  onClick={() => !isInstalled && onInstall(t.recipe)}
                  disabled={isInstalled}
                >
                  {isInstalled ? 'Installed' : 'Add'}
                </button>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
