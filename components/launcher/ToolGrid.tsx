import { CategoryHeader } from './CategoryHeader'
import { ToolCard } from './ToolCard'
import type { Tool, CategoryId } from '@/types'
import { CATEGORIES } from '@/lib/constants'

interface ToolGridProps {
  tools: Tool[]
  configuredKeys: string[]
}

export function ToolGrid({ tools, configuredKeys }: ToolGridProps) {
  const categoryOrder: CategoryId[] = ['knowledge', 'work', 'personal', 'health']

  return (
    <div className="flex flex-col gap-10">
      {categoryOrder.map((catId) => {
        const category = CATEGORIES.find((c) => c.id === catId)!
        const categoryTools = tools.filter((t) => t.category === catId)
        if (categoryTools.length === 0) return null

        return (
          <section key={catId}>
            <CategoryHeader id={catId} name={category.name} />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {categoryTools.map((tool) => {
                const missingKeys =
                  tool.type === 'builtin' &&
                  tool.requiredKeys !== undefined &&
                  tool.requiredKeys.some((k) => !configuredKeys.includes(k))

                return (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    missingKeys={missingKeys}
                  />
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
