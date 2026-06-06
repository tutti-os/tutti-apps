import { ScrollArea } from "@/components/ui/scroll-area";
import type { CategorySummary } from "@/features/trending/types";

import { CategorySection } from "./category-section";

type CategoryBoardProps = {
  categories: CategorySummary[];
  onRepoSelect: (repoId: string) => void;
  selectedRepoId: string;
};

export function CategoryBoard({
  categories,
  onRepoSelect,
  selectedRepoId,
}: CategoryBoardProps) {
  return (
    <ScrollArea className="min-h-0 min-w-0 flex-1">
      <main className="flex flex-col gap-5" id="category-board">
        {categories.map((category) => (
          <CategorySection
            category={category}
            key={category.id}
            onRepoSelect={onRepoSelect}
            selectedRepoId={selectedRepoId}
          />
        ))}
      </main>
    </ScrollArea>
  );
}
