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
    <aside className="steep-soft-panel flex min-h-0 w-full shrink-0 flex-col rounded-[2rem] border border-sidebar-border bg-sidebar/92 text-sidebar-foreground backdrop-blur lg:w-60">
      <nav aria-label="Categories" className="flex flex-col gap-3 p-4">
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
                  "flex h-10 items-center gap-2 rounded-full border px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                  selected
                    ? "border-sidebar-primary bg-sidebar-primary text-sidebar-primary-foreground"
                    : "border-transparent text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground",
                )}
                key={category.id}
                onClick={() => onCategorySelect(category.id)}
                type="button"
              >
                <Icon aria-hidden="true" className="size-4" />
                <span className="min-w-0 flex-1 truncate">
                  {category.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    selected
                      ? "text-sidebar-primary-foreground/70"
                      : "text-muted-foreground",
                  )}
                >
                  {category.repoCount}
                </span>
                <span
                  className={cn(
                    "font-mono text-xs",
                    selected
                      ? "text-sidebar-primary-foreground"
                      : "text-accent-foreground",
                  )}
                >
                  {formatDelta(category.delta)}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <Separator className="max-lg:hidden" />

      <div className="flex flex-col gap-2 p-4 max-lg:hidden">
        <h2 className="px-1 text-xs font-medium uppercase text-muted-foreground">
          Saved collections
        </h2>
        <div className="flex flex-col gap-1">
          {savedCollections.map(([label, count]) => (
            <Button
              className="justify-start gap-2 rounded-full text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
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

      <div className="flex flex-col gap-2 p-4 max-lg:hidden">
        <h2 className="px-1 text-xs font-medium uppercase text-muted-foreground">
          Pinned topics
        </h2>
        <div className="flex flex-col gap-1">
          {pinnedTopics.map(([label, delta]) => (
            <Button
              className="justify-start gap-2 rounded-full border-sidebar-border bg-sidebar-accent text-muted-foreground hover:bg-muted hover:text-sidebar-foreground"
              key={label}
              variant="outline"
            >
              <span className="min-w-0 flex-1 truncate text-left">{label}</span>
              <span className="font-mono text-xs text-accent-foreground">
                {formatDelta(delta as number)}
              </span>
            </Button>
          ))}
        </div>
      </div>

      <div className="mt-auto p-4 max-lg:hidden">
        <div className="rounded-3xl border border-sidebar-border bg-sidebar-accent p-4 text-sm">
          <div className="font-medium text-sidebar-foreground">Tip</div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Press search to filter repos, owners, and topics.
          </p>
        </div>
      </div>
    </aside>
  );
}
