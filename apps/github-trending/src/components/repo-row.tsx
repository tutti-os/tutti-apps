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
        "grid min-h-20 w-full grid-cols-[2rem_minmax(0,1fr)] items-center gap-3 border-t border-border/80 px-6 py-3.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:grid-cols-[2rem_minmax(10rem,1fr)_5rem_7rem] xl:grid-cols-[2rem_minmax(12rem,1fr)_5rem_7rem_6rem] 2xl:grid-cols-[2rem_minmax(12rem,1fr)_5rem_7rem_6rem_8rem]",
        selected ? "bg-accent/85" : "hover:bg-muted/45",
      )}
      onClick={() => onSelect(repo.id)}
      type="button"
    >
      <span
        className={cn(
          "font-mono text-muted-foreground",
          selected && "text-accent-foreground",
        )}
      >
        {index + 1}
      </span>

      <span className="min-w-0">
        <span className="block truncate font-semibold text-card-foreground">
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

      <span className="font-mono font-semibold text-accent-foreground max-lg:col-start-2">
        {formatStarsGained(repo.starsGained)}
      </span>

      <span className="flex items-center gap-2 text-muted-foreground max-lg:col-start-2">
        <span className={cn("size-2 rounded-full", repo.languageColor)} />
        {repo.language}
      </span>

      <span className="text-muted-foreground max-xl:hidden">
        {repo.license}
      </span>

      <span className="rounded-2xl border border-border bg-muted p-3 max-2xl:hidden">
        <span className="block truncate text-xs font-medium text-card-foreground">
          {repo.readmePreview.title}
        </span>
        <span className="mt-1 block truncate font-mono text-[0.7rem] text-primary">
          {repo.readmePreview.codePreview}
        </span>
      </span>
    </button>
  );
}
