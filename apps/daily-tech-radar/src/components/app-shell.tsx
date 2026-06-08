import {
  BotIcon,
  BoxesIcon,
  CalendarIcon,
  Code2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  ExternalLinkIcon,
  Grid2X2Icon,
  ImageIcon,
  ListIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Zoom from "react-medium-image-zoom";

import {
  filterRadarCards,
  getVisibleCategories,
} from "@/features/radar/filtering";
import {
  primaryDisplayTags,
  secondaryDisplayTags,
} from "@/features/radar/taxonomy";
import type {
  RadarBoard,
  RadarCard,
  RadarSource,
  RadarViewMode,
} from "@/features/radar/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type SearchState = {
  category: string;
  date: string;
  query: string;
  source: RadarSource;
  view: RadarViewMode;
};

type AppShellProps = {
  board: RadarBoard;
  onSearchStateChange: (next: SearchState) => void;
  searchState: SearchState;
};

const sourceLabels: Record<RadarSource, string> = {
  all: "全部",
  github: "GitHub",
  producthunt: "Product Hunt",
};

export function AppShell({
  board,
  onSearchStateChange,
  searchState,
}: AppShellProps) {
  const [selectedCard, setSelectedCard] = useState<RadarCard | null>(null);
  const categories = useMemo(
    () => getVisibleCategories(board.cards, searchState.source),
    [board.cards, searchState.source],
  );
  const categoryExists =
    searchState.category === "all" ||
    categories.some((category) => category.label === searchState.category);
  const effectiveCategory = categoryExists ? searchState.category : "all";
  const visibleCards = filterRadarCards(board.cards, {
    category: effectiveCategory,
    query: searchState.query,
    source: searchState.source,
  });

  function updateState(partial: Partial<SearchState>) {
    onSearchStateChange({
      ...searchState,
      category: effectiveCategory,
      ...partial,
    });
  }

  return (
    <main className="radar-app">
      <TopNav
        availableDates={board.availableDates}
        date={searchState.date || board.date}
        source={searchState.source}
        onDateChange={(date) => updateState({ category: "all", date })}
        onSourceChange={(source) => updateState({ category: "all", source })}
      />
      <HeroSection
        board={board}
        query={searchState.query}
        onClear={() => updateState({ query: "" })}
        onQueryChange={(query) => updateState({ query })}
      />
      <Toolbar
        categories={categories}
        category={effectiveCategory}
        view={searchState.view}
        onCategoryChange={(category) => updateState({ category })}
        onViewChange={(view) => updateState({ view })}
      />
      <section className="radar-layout">
        <RadarSidebar
          board={board}
          date={searchState.date || board.date}
          source={searchState.source}
          category={effectiveCategory}
          visibleCount={visibleCards.length}
          onDateChange={(date) => updateState({ category: "all", date })}
        />
        <div>
          <CardGrid
            cards={visibleCards}
            view={searchState.view}
            onOpen={setSelectedCard}
          />
          {visibleCards.length === 0 ? (
            <EmptyState date={searchState.date || board.date} />
          ) : null}
        </div>
      </section>
      <DetailDrawer
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
      />
    </main>
  );
}

function TopNav({
  availableDates,
  date,
  onDateChange,
  onSourceChange,
  source,
}: {
  availableDates: string[];
  date: string;
  onDateChange: (date: string) => void;
  onSourceChange: (source: RadarSource) => void;
  source: RadarSource;
}) {
  return (
    <nav className="radar-nav">
      <div className="radar-brand">
        <span className="radar-mark" />
        <span>每日产品雷达</span>
      </div>
      <div className="radar-nav-actions">
        {(["all", "producthunt", "github"] as RadarSource[]).map((item) => (
          <button
            className={`radar-pill ${source === item ? "active" : ""}`}
            key={item}
            onClick={() => onSourceChange(item)}
            type="button"
          >
            {sourceLabels[item]}
          </button>
        ))}
        <DatePicker
          availableDates={availableDates}
          className="radar-nav-date"
          date={date}
          label={date}
          onDateChange={onDateChange}
        />
      </div>
    </nav>
  );
}

function HeroSection({
  board,
  onClear,
  onQueryChange,
  query,
}: {
  board: RadarBoard;
  onClear: () => void;
  onQueryChange: (query: string) => void;
  query: string;
}) {
  const [draftQuery, setDraftQuery] = useState(query);
  const [isComposing, setIsComposing] = useState(false);

  useEffect(() => {
    if (!isComposing) {
      setDraftQuery(query);
    }
  }, [isComposing, query]);

  function handleClear() {
    setIsComposing(false);
    setDraftQuery("");
    onClear();
  }

  function handleQueryChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.currentTarget.value;
    const nativeEvent = event.nativeEvent as InputEvent;

    setDraftQuery(nextQuery);
    if (!isComposing && !nativeEvent.isComposing) {
      onQueryChange(nextQuery);
    }
  }

  function handleCompositionEnd(
    event: React.CompositionEvent<HTMLInputElement>,
  ) {
    const nextQuery = event.currentTarget.value;

    setIsComposing(false);
    setDraftQuery(nextQuery);
    onQueryChange(nextQuery);
  }

  return (
    <section className="radar-hero">
      <div>
        <h1>
          发现今天
          <br />
          值得跟进的新产品
        </h1>
        <p>
          汇总 Product Hunt 新品发布与 GitHub
          热门仓库，按日期、分类和来源整理成一组可筛选、可点开的产品发现卡片。
        </p>
        <label className="radar-search">
          <SearchIcon aria-hidden="true" size={17} />
          <span className="sr-only">搜索产品、仓库、语言和标签</span>
          <input
            onChange={handleQueryChange}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={() => setIsComposing(true)}
            placeholder="搜索 SellerClaw、agent、TypeScript、图像生成"
            value={draftQuery}
          />
          {draftQuery ? (
            <button
              aria-label="清空搜索"
              className="radar-icon-button"
              onClick={handleClear}
              type="button"
            >
              <XIcon size={16} />
            </button>
          ) : null}
        </label>
      </div>
      <SignalPanel board={board} />
    </section>
  );
}

function SignalPanel({ board }: { board: RadarBoard }) {
  return (
    <aside className="radar-signal">
      <h2>今日发现信号</h2>
      <p>今天的机会集中在 AI agent、电商自动化、图像生成和开发者工具。</p>
      <div className="radar-mini-metrics">
        <Metric value={String(board.metrics.productHuntCount)} label="新品发布" />
        <Metric value={String(board.metrics.githubCount)} label="GitHub 仓库" />
        <Metric value={`${board.metrics.aiPercent}%`} label="AI 相关" />
      </div>
    </aside>
  );
}

function Toolbar({
  categories,
  category,
  onCategoryChange,
  onViewChange,
  view,
}: {
  categories: Array<{ count: number; label: string }>;
  category: string;
  onCategoryChange: (category: string) => void;
  onViewChange: (view: RadarViewMode) => void;
  view: RadarViewMode;
}) {
  return (
    <div className="radar-toolbar">
      <div className="radar-filters">
        <button
          className={`radar-pill ${category === "all" ? "active" : ""}`}
          onClick={() => onCategoryChange("all")}
          type="button"
        >
          全部
        </button>
        {categories.map((item) => (
          <button
            className={`radar-pill ${category === item.label ? "active" : ""}`}
            key={item.label}
            onClick={() => onCategoryChange(item.label)}
            type="button"
          >
            {item.label} {item.count}
          </button>
        ))}
      </div>
      <div className="radar-tabs" aria-label="视图模式">
        <button
          className={`radar-pill ${view === "grid" ? "active" : ""}`}
          onClick={() => onViewChange("grid")}
          type="button"
        >
          <Grid2X2Icon aria-hidden="true" size={15} />
          卡片
        </button>
        <button
          className={`radar-pill ${view === "compact" ? "active" : ""}`}
          onClick={() => onViewChange("compact")}
          type="button"
        >
          <ListIcon aria-hidden="true" size={15} />
          紧凑
        </button>
      </div>
    </div>
  );
}

function RadarSidebar({
  board,
  category,
  date,
  onDateChange,
  source,
  visibleCount,
}: {
  board: RadarBoard;
  category: string;
  date: string;
  onDateChange: (date: string) => void;
  source: RadarSource;
  visibleCount: number;
}) {
  const sourceLabel = source === "all" ? "全部来源" : sourceLabels[source];
  const categoryLabel = category === "all" ? "全部分类" : category;
  const quickDates = board.availableDates.slice(0, 5);
  const hasMoreDates = board.availableDates.length > quickDates.length;

  return (
    <aside className="radar-sidebar">
      <div className="radar-sidebar-card">
        <h3>内容入口</h3>
        <div className="radar-topic">
          <span>Product Hunt 发布</span>
          <span>{board.metrics.productHuntCount}</span>
        </div>
        <div className="radar-topic">
          <span>GitHub 仓库</span>
          <span>{board.metrics.githubCount}</span>
        </div>
        <div className="radar-topic">
          <span>跨来源洞察</span>
          <span>{board.categories.slice(0, 3).length}</span>
        </div>
      </div>
      <div className="radar-sidebar-card">
        <h3>日期</h3>
        <div className="radar-date-list">
          {quickDates.map((item) => (
            <button
              className={`radar-pill ${date === item ? "active" : ""}`}
              key={item}
              onClick={() => onDateChange(item)}
              type="button"
            >
              {formatDateChipLabel(item)} · {item.slice(5)}
            </button>
          ))}
          {hasMoreDates ? (
            <DatePicker
              availableDates={board.availableDates}
              date={date}
              label="更多日期"
              onDateChange={onDateChange}
            />
          ) : null}
        </div>
      </div>
      <div className="radar-scope-card">
        <h3>当前范围</h3>
        <p>
          正在查看 {date} 的 {sourceLabel} / {categoryLabel}，共 {visibleCount}{" "}
          张卡片。
        </p>
      </div>
    </aside>
  );
}

function DatePicker({
  availableDates,
  className = "",
  date,
  label,
  onDateChange,
}: {
  availableDates: string[];
  className?: string;
  date: string;
  label: string;
  onDateChange: (date: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const selectedDate = parseDateKey(date);
  const latestDate = availableDates[0] ?? "";
  const latestMonth = parseDateKey(selectedDate ? date : latestDate);
  const [month, setMonth] = useState<Date | undefined>(latestMonth);
  const availableDateSet = useMemo(
    () => new Set(availableDates),
    [availableDates],
  );

  function handleSelect(nextDate: Date | undefined) {
    if (!nextDate) {
      return;
    }

    const nextDateKey = dateKeyFromLocalDate(nextDate);
    if (!availableDateSet.has(nextDateKey)) {
      return;
    }

    onDateChange(nextDateKey);
    setMonth(nextDate);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`radar-pill radar-date-trigger ${className}`}
          disabled={!availableDates.length}
          type="button"
        >
          <CalendarIcon aria-hidden="true" size={15} />
          {availableDates.length ? label : "暂无日期"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="radar-date-popover">
        <Calendar
          mode="single"
          {...(selectedDate ? { selected: selectedDate } : {})}
          {...(month ? { month } : {})}
          onMonthChange={setMonth}
          onSelect={handleSelect}
          disabled={(calendarDate) =>
            !availableDateSet.has(dateKeyFromLocalDate(calendarDate))
          }
          captionLayout="dropdown"
        />
        <div className="radar-date-popover-footer">
          <span>仅可选择有数据的日期</span>
          <strong>{availableDates.length} 天</strong>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CardGrid({
  cards,
  onOpen,
  view,
}: {
  cards: RadarCard[];
  onOpen: (card: RadarCard) => void;
  view: RadarViewMode;
}) {
  return (
    <section className={`radar-grid ${view === "compact" ? "compact" : ""}`}>
      {cards.map((card) => (
        <RadarCardView
          card={card}
          key={card.id}
          onOpen={() => onOpen(card)}
        />
      ))}
    </section>
  );
}

function RadarCardView({
  card,
  onOpen,
}: {
  card: RadarCard;
  onOpen: () => void;
}) {
  const tags = primaryDisplayTags(card);

  return (
    <article className="radar-card">
      <Cover card={card} />
      <div className="radar-card-body">
        <div className="radar-title-row">
          <CardAvatar card={card} />
          <div className="radar-card-heading">
            <h3>{card.title}</h3>
            <div className="radar-source">{card.sourceLabel}</div>
          </div>
        </div>
        <p className="radar-desc">{card.description}</p>
        <div className="radar-tags">
          {tags.map((tag) => (
            <span className="radar-tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
        <Stats card={card} />
      </div>
      <button
        aria-label={`查看 ${card.title}`}
        className="radar-card-action"
        onClick={onOpen}
        type="button"
      />
    </article>
  );
}

function Cover({ card }: { card: RadarCard }) {
  const badge = card.type === "github" ? card.language || "GitHub" : "Product Hunt";
  const useSemanticCover = card.type === "github" && card.coverStyle === "semantic";

  return (
    <div
      className={`radar-cover ${card.type === "github" ? "repo" : ""} ${
        useSemanticCover ? "semantic" : ""
      }`}
    >
      {useSemanticCover ? (
        <SemanticCover card={card} />
      ) : card.coverUrl ? (
        <img src={card.coverUrl} alt="" />
      ) : null}
      <span className="radar-badge">{badge}</span>
    </div>
  );
}

function CardAvatar({ card }: { card: RadarCard }) {
  const [failed, setFailed] = useState(false);

  if (card.type === "producthunt") {
    return card.iconUrl && !failed ? (
      <img
        className="radar-app-icon"
        src={card.iconUrl}
        alt=""
        onError={() => setFailed(true)}
      />
    ) : (
      <div className="radar-app-icon generated" />
    );
  }

  return card.iconUrl && !failed ? (
    <img
      className="radar-repo-icon image"
      src={card.iconUrl}
      alt=""
      onError={() => setFailed(true)}
    />
  ) : (
    <div className="radar-repo-icon">{card.name.slice(0, 2).toUpperCase()}</div>
  );
}

function SemanticCover({ card }: { card: RadarCard }) {
  const model = semanticCoverModel(card);
  const Icon = model.icon;

  return (
    <div className={`radar-semantic-cover ${model.tone}`}>
      <div className="radar-semantic-copy">
        <span>{model.kicker}</span>
        <strong>{model.title}</strong>
      </div>
      <div className="radar-semantic-flow" aria-hidden="true">
        <span>{model.steps[0]}</span>
        <i />
        <span>{model.steps[1]}</span>
        <i />
        <span>{model.steps[2]}</span>
      </div>
      <div className="radar-semantic-icon" aria-hidden="true">
        <Icon size={26} />
      </div>
    </div>
  );
}

function Stats({ card }: { card: RadarCard }) {
  if (card.type === "github") {
    return (
      <div className="radar-stats">
        <span>{formatCount(card.metrics.stars)} stars</span>
        <span>{formatCount(card.metrics.forks)} forks</span>
      </div>
    );
  }

  return (
    <div className="radar-stats">
      <span>{card.metrics.votes ?? 0} votes</span>
      <span>{card.metrics.comments ?? 0} comments</span>
    </div>
  );
}

export function DetailDrawer({
  card,
  onClose,
}: {
  card: RadarCard | null;
  onClose: () => void;
}) {
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const media = card?.media?.length
    ? card.media
    : card?.coverUrl
      ? [{ type: "image", url: card.coverUrl }]
      : [];
  const activeMedia = media[activeMediaIndex] ?? media[0];
  const secondaryTags = card ? secondaryDisplayTags(card) : [];

  useEffect(() => {
    setActiveMediaIndex(0);
  }, [card?.id]);

  function changeMediaIndex(direction: -1 | 1) {
    setActiveMediaIndex(
      (currentIndex) => (currentIndex + direction + media.length) % media.length,
    );
  }

  return (
    <aside
      aria-hidden={card ? "false" : "true"}
      className={`radar-drawer ${card ? "open" : ""}`}
    >
      <button
        aria-label="关闭详情"
        className="radar-close"
        onClick={onClose}
        type="button"
      >
        <XIcon size={17} />
      </button>
      {card ? (
        <div className="radar-drawer-inner">
          <div className="radar-drawer-hero">
            {activeMedia ? (
              activeMedia.videoUrl ? (
                <video controls poster={activeMedia.url} src={activeMedia.videoUrl} />
              ) : (
                <Zoom
                  a11yNameButtonUnzoom="关闭大图"
                  a11yNameButtonZoom="放大图片"
                  ZoomContent={({ buttonUnzoom, img }) => (
                    <div className="radar-zoom-content">
                      {img}
                      {media.length > 1 ? (
                        <div className="radar-zoom-gallery-controls">
                          <button
                            aria-label="上一张大图"
                            className="radar-gallery-button"
                            onClick={() => changeMediaIndex(-1)}
                            type="button"
                          >
                            <ChevronLeftIcon size={16} />
                          </button>
                          <span>
                            {activeMediaIndex + 1}/{media.length}
                          </span>
                          <button
                            aria-label="下一张大图"
                            className="radar-gallery-button"
                            onClick={() => changeMediaIndex(1)}
                            type="button"
                          >
                            <ChevronRightIcon size={16} />
                          </button>
                        </div>
                      ) : null}
                      {buttonUnzoom}
                    </div>
                  )}
                  zoomMargin={28}
                >
                  <img src={activeMedia.url} alt={card.title} />
                </Zoom>
              )
            ) : card.coverStyle === "semantic" ? (
              <SemanticCover card={card} />
            ) : null}
            {media.length > 1 ? (
              <div className="radar-gallery-controls">
                <button
                  aria-label="上一张产品图"
                  className="radar-gallery-button"
                  onClick={() => changeMediaIndex(-1)}
                  type="button"
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <span>
                  {activeMediaIndex + 1}/{media.length}
                </span>
                <button
                  aria-label="下一张产品图"
                  className="radar-gallery-button"
                  onClick={() => changeMediaIndex(1)}
                  type="button"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            ) : null}
          </div>
          <div className="radar-drawer-content">
            <div className="radar-drawer-title-row">
              <div className="radar-drawer-title-copy">
                <div className="radar-source">
                  {card.sourceLabel}
                </div>
                <h2>{card.title}</h2>
              </div>
              <a
                className="radar-pill primary radar-drawer-title-action"
                href={card.sourceUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                <ExternalLinkIcon aria-hidden="true" size={15} />
                打开来源
              </a>
            </div>
            <p>{card.description}</p>
            <div className="radar-tag-group">
              <div className="radar-tag-label">分类</div>
              <div className="radar-tags">
                {card.categories.map((tag) => (
                  <span className="radar-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            {secondaryTags.length ? (
              <div className="radar-tag-group">
                <div className="radar-tag-label">关键词</div>
                <div className="radar-tags">
                  {secondaryTags.map((tag) => (
                <span className="radar-tag" key={tag}>
                  {tag}
                </span>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="radar-mini-metrics drawer">
              {drawerMetrics(card).map((metric) => (
                <Metric key={metric.label} {...metric} />
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="radar-metric">
      <b>{value}</b>
      <span>{label}</span>
    </div>
  );
}

function EmptyState({ date }: { date: string }) {
  return (
    <div className="radar-empty">
      {date
        ? "没有匹配的卡片，换个关键词或分类试试。"
        : "本地数据包还没有同步。同步后这里会展示当天 Product Hunt 和 GitHub 卡片。"}
    </div>
  );
}

function drawerMetrics(card: RadarCard) {
  if (card.type === "github") {
    return [
      { label: "stars", value: formatCount(card.metrics.stars) },
      { label: "forks", value: formatCount(card.metrics.forks) },
      { label: "score", value: String(card.metrics.score ?? "—") },
    ];
  }

  return [
    { label: "votes", value: String(card.metrics.votes ?? 0) },
    { label: "comments", value: String(card.metrics.comments ?? 0) },
    { label: "rank", value: `#${card.rank}` },
  ];
}

function formatCount(value?: number) {
  if (value == null) {
    return "0";
  }
  if (value >= 1000) {
    return `${Math.round(value / 100) / 10}k`;
  }
  return String(value);
}

export function formatDateChipLabel(
  date: string,
  today = dateKeyFromLocalDate(new Date()),
) {
  const targetDate = parseDateKey(date);
  const todayDate = parseDateKey(today);

  if (!targetDate || !todayDate) {
    return "日期";
  }

  const dayDiff = Math.round(
    (todayDate.getTime() - targetDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return "今天";
  }
  if (dayDiff === 1) {
    return "昨天";
  }
  if (dayDiff === 2) {
    return "前天";
  }
  if (dayDiff > 2 && dayDiff < 7) {
    return `${dayDiff} 天前`;
  }

  return date.slice(5);
}

function parseDateKey(date: string) {
  const parts = date.split("-").map(Number);
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return undefined;
  }
  const [year, month, day] = parts;

  if (year === undefined || month === undefined || day === undefined) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function dateKeyFromLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function semanticCoverModel(card: RadarCard) {
  const text = [
    card.title,
    card.description,
    ...card.categories,
    ...card.keywords,
  ]
    .join(" ")
    .toLowerCase();

  if (text.includes("ocr") || text.includes("document") || text.includes("pdf")) {
    return {
      icon: FileTextIcon,
      kicker: "Document AI",
      steps: ["PDF/图片", "OCR 解析", "结构化数据"],
      title: "把文档变成可用数据",
      tone: "paper",
    };
  }

  if (text.includes("image") || text.includes("图像") || text.includes("生成")) {
    return {
      icon: ImageIcon,
      kicker: "Visual AI",
      steps: ["提示词", "生成", "视觉资产"],
      title: "生成与处理视觉内容",
      tone: "visual",
    };
  }

  if (text.includes("ecommerce") || text.includes("store") || text.includes("商店")) {
    return {
      icon: ShoppingBagIcon,
      kicker: "Commerce Ops",
      steps: ["商品", "代理执行", "订单/客服"],
      title: "自动化电商运营流程",
      tone: "commerce",
    };
  }

  if (text.includes("security") || text.includes("privacy") || text.includes("安全")) {
    return {
      icon: ShieldCheckIcon,
      kicker: "Security",
      steps: ["风险", "检测", "防护"],
      title: "发现并降低安全风险",
      tone: "secure",
    };
  }

  if (text.includes("agent") || text.includes("mcp") || text.includes("workflow")) {
    return {
      icon: BotIcon,
      kicker: "AI Agent",
      steps: ["任务", "代理规划", "自动执行"],
      title: "让代理接手复杂工作流",
      tone: "agent",
    };
  }

  if (text.includes("model") || text.includes("llm") || text.includes("ai")) {
    return {
      icon: SparklesIcon,
      kicker: "AI Model",
      steps: ["数据", "模型推理", "结果"],
      title: "用模型完成智能分析",
      tone: "model",
    };
  }

  if (text.includes("api") || text.includes("framework") || text.includes("typescript")) {
    return {
      icon: Code2Icon,
      kicker: "Developer Tool",
      steps: ["代码", "集成", "发布"],
      title: "加速开发与集成",
      tone: "dev",
    };
  }

  return {
    icon: BoxesIcon,
    kicker: "Open Source",
    steps: ["项目", "能力", "落地"],
    title: "把开源能力接入产品",
    tone: "default",
  };
}
