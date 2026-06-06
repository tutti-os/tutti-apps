import { Badge } from "@/components/ui/badge";
import type { CategorySummary } from "@/features/trending/types";
import { formatDelta } from "@/lib/format";

import { RepoRow } from "./repo-row";

type CategorySectionProps = {
  category: CategorySummary;
  onRepoSelect: (repoId: string) => void;
  selectedRepoId: string;
};

export function CategorySection({
  category,
  onRepoSelect,
  selectedRepoId,
}: CategorySectionProps) {
  return (
    <section
      aria-labelledby={`${category.id}-heading`}
      className="steep-panel overflow-hidden rounded-[2.5rem] border border-border bg-card/95 text-card-foreground backdrop-blur"
      id={category.id}
    >
      <header className="flex min-h-16 flex-wrap items-center gap-3 px-6 py-5">
        <h2
          className="text-xl font-semibold tracking-normal text-card-foreground"
          id={`${category.id}-heading`}
        >
          {category.label}
        </h2>
        <span className="text-sm text-muted-foreground">
          {category.repoCount} repositories
        </span>
        <span className="ml-auto text-sm text-muted-foreground max-sm:ml-0">
          Momentum{" "}
          <span className="font-mono text-card-foreground">
            {category.momentum}
          </span>
        </span>
        <Badge
          className="rounded-full"
          variant={category.tone === "hot" ? "default" : "secondary"}
        >
          {category.tone === "hot" ? "Hot" : "Trending"}
        </Badge>
        <span className="font-mono text-sm text-accent-foreground">
          {formatDelta(category.delta)}
        </span>
      </header>
      <div>
        {category.topRepos.map((repo, index) => (
          <RepoRow
            index={index}
            key={repo.id}
            onSelect={onRepoSelect}
            repo={repo}
            selected={repo.id === selectedRepoId}
          />
        ))}
      </div>
    </section>
  );
}
