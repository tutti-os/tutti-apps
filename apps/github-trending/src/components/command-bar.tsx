import {
  GitBranchIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BoardCacheStatus, TrendRange } from "@/features/trending/types";
import { formatRange, formatUtcTime } from "@/lib/format";

type CommandBarProps = {
  cacheStatus: BoardCacheStatus;
  capturedAt: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onSinceChange: (since: TrendRange) => void;
  refreshing: boolean;
  searchQuery: string;
  since: TrendRange;
};

const ranges: TrendRange[] = ["daily", "weekly", "monthly"];
const languages = ["All", "TypeScript", "Python", "Rust", "JavaScript"];
const cacheStatusLabels: Record<BoardCacheStatus, string> = {
  fallback: "Showing fallback data",
  fresh: "Cache updated",
  stale: "Showing cached data",
};

export function CommandBar({
  cacheStatus,
  capturedAt,
  language,
  onLanguageChange,
  onRefresh,
  onSearchChange,
  onSinceChange,
  refreshing,
  searchQuery,
  since,
}: CommandBarProps) {
  return (
    <header className="flex min-h-14 flex-wrap items-center gap-3 border-b border-border bg-background px-4 py-2 lg:flex-nowrap">
      <div className="flex min-w-0 items-center gap-3 sm:min-w-52">
        <div className="flex size-8 items-center justify-center rounded-md border border-primary/40 bg-primary/15 text-sm font-semibold text-primary">
          T
        </div>
        <div className="min-w-0">
          <div className="truncate font-semibold text-foreground">
            TrendReader
          </div>
          <div className="truncate text-xs text-muted-foreground">
            GitHub Trending README Reader
          </div>
        </div>
      </div>

      <label
        className="relative order-3 min-w-0 flex-1 basis-full sm:order-none sm:basis-72"
        htmlFor="repo-search"
      >
        <span className="sr-only">Search repositories, owners, topics</span>
        <SearchIcon
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          className="h-9 rounded-md border-border bg-card pl-9 text-sm"
          id="repo-search"
          name="repo-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search repositories, owners, topics..."
          value={searchQuery}
        />
      </label>

      <ToggleGroup
        aria-label="Trend range"
        className="max-sm:order-4"
        onValueChange={(value) => value && onSinceChange(value as TrendRange)}
        type="single"
        value={since}
        variant="outline"
      >
        {ranges.map((range) => (
          <ToggleGroupItem key={range} value={range}>
            {formatRange(range)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select name="language" onValueChange={onLanguageChange} value={language}>
        <SelectTrigger
          aria-label="Language"
          className="w-36 bg-card"
          id="language-select"
        >
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {languages.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <Button
        aria-busy={refreshing}
        disabled={refreshing}
        onClick={onRefresh}
        variant="outline"
      >
        <RefreshCwIcon data-icon="inline-start" />
        {refreshing ? "Refreshing" : "Refresh"}
      </Button>

      <Button asChild variant="outline">
        <a
          href="https://github.com/trending"
          rel="noreferrer noopener"
          target="_blank"
        >
          <GitBranchIcon data-icon="inline-start" />
          Open on GitHub
        </a>
      </Button>

      <Badge
        className="hidden h-9 gap-2 rounded-md px-3 xl:inline-flex"
        variant="outline"
      >
        <span className="size-2 rounded-full bg-accent" />
        {cacheStatusLabels[cacheStatus]}
        <span className="text-muted-foreground">
          {formatUtcTime(capturedAt)}
        </span>
      </Badge>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button aria-label="Settings" size="icon" variant="outline">
            <SettingsIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}
