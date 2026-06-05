import { StarIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RepoSummary } from "@/features/trending/types";
import { formatCompactNumber, formatStarsGained } from "@/lib/format";
import { cn } from "@/lib/utils";

type RepoRowProps = {
  index: number;
  onSelect: (repoId: string) => void;
  repo: RepoSummary;
  selected: boolean;
};

export function RepoRow({ index, onSelect, repo, selected }: RepoRowProps) {
  return (
    <button
      aria-pressed={selected}
      className={cn(
        "grid min-h-20 w-full grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 border-t border-border px-3 py-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[2rem_minmax(16rem,1fr)_7rem_7rem_6rem_9rem]",
        selected
          ? "border-primary/60 bg-primary/10 shadow-[inset_0_0_0_1px_var(--primary)]"
          : "hover:bg-muted/50",
      )}
      onClick={() => onSelect(repo.id)}
      type="button"
    >
      <span className="font-mono text-muted-foreground">{index + 1}</span>

      <span className="min-w-0">
        <span className="block truncate font-medium text-foreground">
          {repo.fullName}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {repo.description}
        </span>
        <span className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <StarIcon aria-hidden="true" className="size-3" />
          {formatCompactNumber(repo.stars)}
          {repo.topics.slice(0, 3).map((topic) => (
            <Badge key={topic} variant="outline">
              {topic}
            </Badge>
          ))}
        </span>
      </span>

      <span className="font-mono text-accent max-lg:col-start-2">
        {formatStarsGained(repo.starsGained)}
      </span>

      <span className="flex items-center gap-2 text-muted-foreground max-lg:col-start-2">
        <span className={cn("size-2 rounded-full", repo.languageColor)} />
        {repo.language}
      </span>

      <span className="text-muted-foreground max-lg:hidden">
        {repo.license}
      </span>

      <span className="rounded-md border border-border bg-card p-2 max-lg:hidden">
        <span className="block truncate text-xs font-medium text-foreground">
          {repo.readmePreview.title}
        </span>
        <span className="mt-1 block truncate font-mono text-[0.7rem] text-primary">
          {repo.readmePreview.codePreview}
        </span>
      </span>
    </button>
  );
}
