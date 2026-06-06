import { GitBranchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RepoReadme } from "@/features/readme/types";
import type { RepoSummary } from "@/features/trending/types";

import { MarkdownRenderer } from "./markdown-renderer";

type ReadmePanelProps = {
  readme: RepoReadme;
  repo: RepoSummary;
};

export function ReadmePanel({ readme, repo }: ReadmePanelProps) {
  return (
    <aside className="steep-panel flex min-h-0 w-full shrink-0 flex-col rounded-[2.5rem] border border-border bg-card/96 text-card-foreground backdrop-blur lg:w-[30rem] xl:w-[32rem] 2xl:w-[34rem]">
      <header className="flex min-h-20 flex-wrap items-center gap-3 border-b border-border/80 px-6 py-5">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-semibold text-card-foreground">
            {repo.fullName}
          </h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            Cached README · {repo.language} · {repo.license}
          </p>
        </div>
        <Button asChild className="rounded-full" variant="outline">
          <a href={repo.url} rel="noreferrer noopener" target="_blank">
            <GitBranchIcon data-icon="inline-start" />
            Open on GitHub
          </a>
        </Button>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-7 px-8 py-8">
          <MarkdownRenderer markdown={readme.markdown} />
        </div>
      </ScrollArea>
    </aside>
  );
}
