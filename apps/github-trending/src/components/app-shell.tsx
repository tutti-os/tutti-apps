import { useState } from "react";

import type { RepoReadme } from "@/features/readme/types";
import type {
  CategoryBoard,
  RepoSummary,
  TrendRange,
} from "@/features/trending/types";

import { CategoryBoard as CategoryBoardView } from "./category-board";
import { CategorySidebar } from "./category-sidebar";
import { CommandBar } from "./command-bar";
import { ReadmePanel } from "./readme-panel";

type AppShellProps = {
  board: CategoryBoard;
  language: string;
  onLanguageChange: (language: string) => void;
  onRefresh: () => void;
  onRepoSelect: (repoId: string) => void;
  onSinceChange: (since: TrendRange) => void;
  readme: RepoReadme;
  refreshing: boolean;
  selectedRepo: RepoSummary;
  since: TrendRange;
};

export function AppShell({
  board,
  language,
  onLanguageChange,
  onRefresh,
  onRepoSelect,
  onSinceChange,
  readme,
  refreshing,
  selectedRepo,
  since,
}: AppShellProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategoryId, setActiveCategoryId] = useState(
    board.categories[0]?.id ?? "ai-infra",
  );
  const filteredCategories = board.categories
    .map((category) => ({
      ...category,
      topRepos: category.topRepos.filter((repo) =>
        [repo.fullName, repo.description, repo.language, ...repo.topics]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.topRepos.length > 0);

  const visibleCategories =
    searchQuery.trim().length > 0 ? filteredCategories : board.categories;

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground lg:h-[100dvh] lg:min-h-[720px] lg:overflow-hidden">
      <CommandBar
        cacheStatus={board.cacheStatus}
        capturedAt={board.capturedAt}
        language={language}
        onLanguageChange={onLanguageChange}
        onRefresh={onRefresh}
        onSearchChange={setSearchQuery}
        onSinceChange={onSinceChange}
        refreshing={refreshing}
        searchQuery={searchQuery}
        since={since}
      />
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:overflow-hidden">
        <CategorySidebar
          activeCategoryId={
            visibleCategories.some(
              (category) => category.id === activeCategoryId,
            )
              ? activeCategoryId
              : (visibleCategories[0]?.id ?? "ai-infra")
          }
          categories={board.categories}
          onCategorySelect={(categoryId) => {
            setActiveCategoryId(categoryId);
            document.getElementById(categoryId)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }}
        />
        <CategoryBoardView
          categories={visibleCategories}
          onRepoSelect={onRepoSelect}
          selectedRepoId={selectedRepo.id}
        />
        <ReadmePanel readme={readme} repo={selectedRepo} />
      </div>
    </div>
  );
}
