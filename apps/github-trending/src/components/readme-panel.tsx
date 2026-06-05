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
    <aside className="flex min-h-0 w-full shrink-0 flex-col border-t border-border bg-background lg:w-[42rem] lg:border-t-0 lg:border-l">
      <header className="flex min-h-16 flex-wrap items-center gap-3 border-b border-border px-4 py-3">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-base font-semibold text-foreground">
            {repo.fullName}
          </h2>
          <p className="mt-1 truncate text-xs text-muted-foreground">
            Cached README · {repo.language} · {repo.license}
          </p>
        </div>
        <Button asChild variant="outline">
          <a href={repo.url} rel="noreferrer noopener" target="_blank">
            <GitBranchIcon data-icon="inline-start" />
            Open on GitHub
          </a>
        </Button>
      </header>
      <ScrollArea className="min-h-0 flex-1">
        <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-6">
          <MarkdownRenderer markdown={readme.markdown} />
        </div>
      </ScrollArea>
    </aside>
  );
}
