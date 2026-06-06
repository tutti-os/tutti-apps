import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  Grid2X2Icon,
  HeartIcon,
  ListIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

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
  const [favorites, setFavorites] = useState<string[]>([]);
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

  useEffect(() => {
    const raw = window.localStorage.getItem("daily-tech-radar:favorites");
    if (raw) {
      setFavorites(JSON.parse(raw) as string[]);
    }
  }, []);

  function updateState(partial: Partial<SearchState>) {
    onSearchStateChange({
      ...searchState,
      category: effectiveCategory,
      ...partial,
    });
  }

  function toggleFavorite(cardId: string) {
    const next = favorites.includes(cardId)
      ? favorites.filter((id) => id !== cardId)
      : [...favorites, cardId];
    setFavorites(next);
    window.localStorage.setItem(
      "daily-tech-radar:favorites",
      JSON.stringify(next),
    );
  }

  return (
    <main className="radar-app">
      <TopNav
        date={searchState.date || board.date}
        source={searchState.source}
        onSourceChange={(source) => updateState({ category: "all", source })}
        onTodayClick={() => updateState({ date: board.date })}
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
            favorites={favorites}
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
        favorite={selectedCard ? favorites.includes(selectedCard.id) : false}
        onClose={() => setSelectedCard(null)}
        onFavorite={() => {
          if (selectedCard) {
            toggleFavorite(selectedCard.id);
          }
        }}
      />
    </main>
  );
}

function TopNav({
  date,
  onSourceChange,
  onTodayClick,
  source,
}: {
  date: string;
  onSourceChange: (source: RadarSource) => void;
  onTodayClick: () => void;
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
        <button className="radar-pill" onClick={onTodayClick} type="button">
          {date}
        </button>
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
  return (
    <section className="radar-hero">
      <div>
        <h1>每天发现值得试用与跟进的新产品。</h1>
        <p>
          汇总 Product Hunt 新品发布与 GitHub
          热门仓库，按日期、分类和来源整理成一组可筛选、可收藏、可点开的产品发现卡片。
        </p>
        <label className="radar-search">
          <SearchIcon aria-hidden="true" size={17} />
          <span className="sr-only">搜索产品、仓库、语言和标签</span>
          <input
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="搜索 SellerClaw、agent、TypeScript、图像生成"
            value={query}
          />
          <button
            aria-label="清空搜索"
            className="radar-icon-button"
            onClick={onClear}
            type="button"
          >
            <XIcon size={16} />
          </button>
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
        <Metric value={String(board.metrics.productHuntCount)} label="PH 产品" />
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
          {board.availableDates.map((item, index) => (
            <button
              className={`radar-pill ${date === item ? "active" : ""}`}
              key={item}
              onClick={() => onDateChange(item)}
              type="button"
            >
              {index === 0 ? "今天" : index === 1 ? "昨天" : "前天"} ·{" "}
              {item.slice(5)}
            </button>
          ))}
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

function CardGrid({
  cards,
  favorites,
  onOpen,
  view,
}: {
  cards: RadarCard[];
  favorites: string[];
  onOpen: (card: RadarCard) => void;
  view: RadarViewMode;
}) {
  return (
    <section className={`radar-grid ${view === "compact" ? "compact" : ""}`}>
      {cards.map((card) => (
        <RadarCardView
          card={card}
          favorite={favorites.includes(card.id)}
          key={card.id}
          onOpen={() => onOpen(card)}
        />
      ))}
    </section>
  );
}

function RadarCardView({
  card,
  favorite,
  onOpen,
}: {
  card: RadarCard;
  favorite: boolean;
  onOpen: () => void;
}) {
  const tags = primaryDisplayTags(card);

  return (
    <article className="radar-card">
      <Cover card={card} />
      <div className="radar-card-body">
        <div className="radar-title-row">
          {card.type === "producthunt" ? (
            card.iconUrl ? (
              <img className="radar-app-icon" src={card.iconUrl} alt="" />
            ) : (
              <div className="radar-app-icon generated" />
            )
          ) : (
            <div className="radar-repo-icon">
              {card.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="radar-card-heading">
            <h3>{card.title}</h3>
            <div className="radar-source">
              {favorite ? "已收藏 · " : ""}
              {card.sourceLabel}
            </div>
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

  return (
    <div className={`radar-cover ${card.type === "github" ? "repo" : ""}`}>
      {card.coverUrl ? <img src={card.coverUrl} alt="" /> : null}
      <span className="radar-badge">{badge}</span>
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

function DetailDrawer({
  card,
  favorite,
  onClose,
  onFavorite,
}: {
  card: RadarCard | null;
  favorite: boolean;
  onClose: () => void;
  onFavorite: () => void;
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
                <img src={activeMedia.url} alt="" />
              )
            ) : null}
            {media.length > 1 ? (
              <div className="radar-gallery-controls">
                <button
                  aria-label="上一张产品图"
                  className="radar-gallery-button"
                  onClick={() =>
                    setActiveMediaIndex(
                      (activeMediaIndex - 1 + media.length) % media.length,
                    )
                  }
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
                  onClick={() =>
                    setActiveMediaIndex((activeMediaIndex + 1) % media.length)
                  }
                  type="button"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            ) : null}
          </div>
          <div className="radar-drawer-content">
            <div className="radar-source">
              {card.sourceLabel}
            </div>
            <h2>{card.title}</h2>
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
            <div className="radar-drawer-actions">
              <a
                className="radar-pill primary"
                href={card.sourceUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                <ExternalLinkIcon aria-hidden="true" size={15} />
                打开来源
              </a>
              <button className="radar-pill" onClick={onFavorite} type="button">
                <HeartIcon
                  aria-hidden="true"
                  fill={favorite ? "currentColor" : "none"}
                  size={15}
                />
                {favorite ? "已收藏" : "加入收藏"}
              </button>
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
