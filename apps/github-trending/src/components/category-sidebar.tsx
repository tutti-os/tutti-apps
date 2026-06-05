import {
  BookmarkIcon,
  BrainIcon,
  DatabaseIcon,
  LayoutIcon,
  PackageIcon,
  ShieldIcon,
  TerminalIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { CategorySummary } from "@/features/trending/types";
import { formatDelta } from "@/lib/format";
import { cn } from "@/lib/utils";

type CategorySidebarProps = {
  activeCategoryId: string;
  categories: CategorySummary[];
  onCategorySelect: (categoryId: string) => void;
};

const categoryIcons = {
  box: PackageIcon,
  brain: BrainIcon,
  database: DatabaseIcon,
  layout: LayoutIcon,
  shield: ShieldIcon,
  terminal: TerminalIcon,
};

const savedCollections = [
  ["AI Research", 24],
  ["Best DevTools", 31],
  ["Awesome CLIs", 18],
  ["Startup Stack", 16],
];

const pinnedTopics = [
  ["LLM", 58],
  ["RAG", 41],
  ["Vector DB", 23],
  ["Agent", 37],
];

export function CategorySidebar({
  activeCategoryId,
  categories,
  onCategorySelect,
}: CategorySidebarProps) {
  return (
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-b border-border bg-sidebar lg:w-60 lg:border-r lg:border-b-0">
      <nav aria-label="Categories" className="flex flex-col gap-2 p-3">
        <h2 className="px-1 text-xs font-medium uppercase text-muted-foreground">
          Categories
        </h2>
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap lg:flex-col">
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon];
            const selected = category.id === activeCategoryId;

            return (
              <button
                aria-current={selected}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md border px-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected
                    ? "border-primary/50 bg-primary/15 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground",
                )}
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4" />
                <span className="min-w-0 flex-1 truncate">
                  {category.label}
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {category.repoCount}
                </span>
                <span className="font-mono text-xs text-accent">
                  {formatDelta(category.delta)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Separator className="max-lg:hidden" />

      <div className="flex flex-col gap-2 p-3 max-lg:hidden">
        <h2 className="px-1 text-xs font-medium uppercase text-muted-foreground">
          Saved collections
        </h2>
        <div className="flex flex-col gap-1">
          {savedCollections.map(([label, count]) => (
            <Button
              className="justify-start gap-2 text-muted-foreground"
              key={label}
              variant="ghost"
            >
              <BookmarkIcon data-icon="inline-start" />
              <span className="min-w-0 flex-1 truncate text-left">{label}</span>
              <span className="font-mono text-xs">{count}</span>
            </Button>
          ))}
        </div>
      </div>

      <Separator className="max-lg:hidden" />

      <div className="flex flex-col gap-2 p-3 max-lg:hidden">
        <h2 className="px-1 text-xs font-medium uppercase text-muted-foreground">
          Pinned topics
        </h2>
        <div className="flex flex-col gap-1">
          {pinnedTopics.map(([label, delta]) => (
            <Button
              className="justify-start gap-2 text-muted-foreground"
              key={label}
              variant="outline"
            >
              <span className="min-w-0 flex-1 truncate text-left">{label}</span>
              <span className="font-mono text-xs text-accent">
                {formatDelta(delta as number)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-3 max-lg:hidden">
        <div className="rounded-lg border border-border bg-card p-3 text-sm">
          <div className="font-medium text-foreground">Tip</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Press search to filter repos, owners, and topics.
          </p>
        </div>
      </div>
    </aside>
  );
}
