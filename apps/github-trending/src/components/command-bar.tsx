import {
  GitBranchIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  TrendingUpIcon,
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
    <header className="steep-soft-panel mx-5 mt-5 flex min-h-16 flex-wrap items-center gap-3 rounded-[2rem] border border-border bg-card/90 px-5 py-3 text-foreground backdrop-blur lg:flex-nowrap">
      <div className="flex min-w-0 items-center gap-3 sm:min-w-52">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
          <TrendingUpIcon aria-hidden="true" className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-semibold text-foreground">
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
          className="h-10 rounded-full border-input bg-card pl-9 text-sm text-foreground placeholder:text-muted-foreground"
          id="repo-search"
          name="repo-search"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search repositories, owners, topics..."
          value={searchQuery}
        />
      </label>

      <ToggleGroup
        aria-label="Trend range"
        className="rounded-full bg-muted p-1 max-sm:order-4"
        onValueChange={(value) => value && onSinceChange(value as TrendRange)}
        type="single"
        value={since}
        variant="outline"
      >
        {ranges.map((range) => (
          <ToggleGroupItem
            className="rounded-full text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
            key={range}
            value={range}
          >
            {formatRange(range)}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select name="language" onValueChange={onLanguageChange} value={language}>
        <SelectTrigger
          aria-label="Language"
          className="h-10 w-36 rounded-full border-input bg-card text-foreground"
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
        className="rounded-full"
        disabled={refreshing}
        onClick={onRefresh}
        variant="outline"
      >
        <RefreshCwIcon data-icon="inline-start" />
        {refreshing ? "Refreshing" : "Refresh"}
      </Button>

      <Button asChild className="rounded-full" variant="default">
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
        className="hidden h-10 gap-2 rounded-full border-border bg-card px-3 text-card-foreground xl:inline-flex"
        variant="outline"
      >
        <span className="size-2 rounded-full bg-accent-foreground" />
        {cacheStatusLabels[cacheStatus]}
        <span className="text-muted-foreground">
          {formatUtcTime(capturedAt)}
        </span>
      </Badge>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label="Settings"
            className="rounded-full"
            size="icon"
            variant="outline"
          >
            <SettingsIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Settings</TooltipContent>
      </Tooltip>
    </header>
  );
}
