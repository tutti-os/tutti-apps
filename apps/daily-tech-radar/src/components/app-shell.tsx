import type { TFunction } from "i18next";
import {
  BotIcon,
  BoxesIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Code2Icon,
  ExternalLinkIcon,
  FileTextIcon,
  Grid2X2Icon,
  ImageIcon,
  ListIcon,
  LoaderCircleIcon,
  RotateCcwIcon,
  SearchIcon,
  ShieldCheckIcon,
  ShoppingBagIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Zoom from "react-medium-image-zoom";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  filterRadarCards,
  getVisibleCategories,
} from "@/features/radar/filtering";
import {
  primaryDisplayTags,
  secondaryDisplayTags,
} from "@/features/radar/taxonomy";
import type {
  Locale,
  RadarBoard,
  RadarCard,
  RadarSource,
  RadarViewMode,
} from "@/features/radar/types";
import i18n from "@/i18n";

type SearchState = {
  category: string;
  date: string;
  locale?: Locale;
  query: string;
  source: RadarSource;
  view: RadarViewMode;
};

type AppShellProps = {
  board: RadarBoard;
  onSearchStateChange: (next: SearchState) => void;
  searchState: SearchState;
};

type RadarT = TFunction<"radar">;

const galleryImageLoadingDelayMs = 150;

type GalleryImageProbe = Pick<HTMLImageElement, "complete" | "naturalWidth">;

export function getGalleryImageLoadState(
  src: string | null | undefined,
  loadedImageSrcs: ReadonlySet<string>,
  probe?: GalleryImageProbe,
) {
  const imageIsLoaded = Boolean(
    src &&
      (loadedImageSrcs.has(src) ||
        (probe?.complete === true && probe.naturalWidth > 0)),
  );

  return {
    imageIsLoaded,
    shouldPreload: Boolean(src && !imageIsLoaded),
  };
}

export function AppShell({
  board,
  onSearchStateChange,
  searchState,
}: AppShellProps) {
  const [selectedCard, setSelectedCard] = useState<RadarCard | null>(null);
  const locale = searchState.locale ?? board.locale;
  const { i18n: i18next } = useTranslation("radar");
  const t = useMemo(() => i18n.getFixedT(locale, "radar"), [locale]);
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
      locale,
      ...partial,
    });
  }

  useEffect(() => {
    if (i18next.language !== locale) {
      void i18next.changeLanguage(locale);
    }
  }, [i18next, locale]);

  useEffect(() => {
    const title = t("app.title");

    document.documentElement.lang = locale;
    document.title = title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", title);
  }, [locale, t]);

  return (
    <main className="radar-app">
      <TopNav
        availableDates={board.availableDates}
        date={searchState.date || board.date}
        locale={locale}
        onLocaleChange={(nextLocale) =>
          updateState({ category: "all", locale: nextLocale })
        }
        source={searchState.source}
        t={t}
        onDateChange={(date) => updateState({ category: "all", date })}
        onSourceChange={(source) => updateState({ category: "all", source })}
      />
      <HeroSection
        board={board}
        t={t}
        query={searchState.query}
        onClear={() => updateState({ query: "" })}
        onQueryChange={(query) => updateState({ query })}
      />
      <Toolbar
        categories={categories}
        category={effectiveCategory}
        locale={locale}
        t={t}
        view={searchState.view}
        onCategoryChange={(category) => updateState({ category })}
        onViewChange={(view) => updateState({ view })}
      />
      <section className="radar-layout">
        <RadarSidebar
          board={board}
          date={searchState.date || board.date}
          locale={locale}
          t={t}
          onDateChange={(date) => updateState({ category: "all", date })}
        />
        <div>
          <CardGrid
            cards={visibleCards}
            locale={locale}
            t={t}
            view={searchState.view}
            onOpen={setSelectedCard}
          />
          {visibleCards.length === 0 ? (
            <EmptyState date={searchState.date || board.date} t={t} />
          ) : null}
        </div>
      </section>
      <DetailDrawer
        card={selectedCard}
        locale={locale}
        onClose={() => setSelectedCard(null)}
      />
    </main>
  );
}

function sourceLabelKey(source: RadarSource) {
  if (source === "github") {
    return "sources.github";
  }
  if (source === "producthunt") {
    return "sources.productHunt";
  }
  return "sources.all";
}

function TopNav({
  availableDates,
  date,
  locale,
  onLocaleChange,
  onDateChange,
  onSourceChange,
  source,
  t,
}: {
  availableDates: string[];
  date: string;
  locale: Locale;
  onLocaleChange: (locale: Locale) => void;
  onDateChange: (date: string) => void;
  onSourceChange: (source: RadarSource) => void;
  source: RadarSource;
  t: RadarT;
}) {
  return (
    <nav className="radar-nav">
      <div className="radar-brand">
        <span className="radar-mark" />
        <span>{t("app.title")}</span>
      </div>
      <div className="radar-nav-actions">
        {(["all", "producthunt", "github"] as RadarSource[]).map((item) => (
          <button
            className={`radar-pill ${source === item ? "active" : ""}`}
            key={item}
            onClick={() => onSourceChange(item)}
            type="button"
          >
            {t(sourceLabelKey(item))}
          </button>
        ))}
        <Select
          value={locale}
          onValueChange={(nextLocale) => onLocaleChange(nextLocale as Locale)}
        >
          <SelectTrigger
            aria-label={t("language.label")}
            className="radar-pill min-w-[76px] gap-1.5 border-[var(--control-line)] bg-[var(--control-bg)] px-3 text-[var(--control-ink)] shadow-none outline-none ring-0 focus:border-[var(--control-line)] focus:outline-none focus:ring-0 focus-visible:border-[var(--control-line)] focus-visible:outline-none focus-visible:ring-0 data-[state=open]:border-[var(--control-line)] data-[state=open]:shadow-none"
          >
            <span data-slot="select-value">
              {locale === "zh-CN"
                ? t("language.chinese")
                : t("language.english")}
            </span>
          </SelectTrigger>
          <SelectContent
            align="center"
            className="min-w-[82px] rounded-2xl border border-[var(--control-line)] bg-[var(--control-bg)] p-1.5 text-[var(--control-ink)] shadow-[0_18px_38px_-28px_rgba(23,25,28,0.42)]"
            sideOffset={8}
          >
            <SelectGroup className="flex flex-col gap-1.5">
              <SelectItem
                className="rounded-xl py-2 pl-3 pr-8 text-[14px] focus:[background:var(--view-active-bg)] data-[state=checked]:[background:var(--control-active-bg)] data-[state=checked]:text-[var(--control-active-ink)] [&_[data-slot=select-item-indicator]]:text-[var(--control-active-ink)]"
                value="zh-CN"
              >
                {t("language.chinese")}
              </SelectItem>
              <SelectItem
                className="rounded-xl py-2 pl-3 pr-8 text-[14px] focus:[background:var(--view-active-bg)] data-[state=checked]:[background:var(--control-active-bg)] data-[state=checked]:text-[var(--control-active-ink)] [&_[data-slot=select-item-indicator]]:text-[var(--control-active-ink)]"
                value="en-US"
              >
                {t("language.english")}
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <DatePicker
          availableDates={availableDates}
          className="radar-nav-date"
          date={date}
          label={date}
          t={t}
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
  t,
}: {
  board: RadarBoard;
  onClear: () => void;
  onQueryChange: (query: string) => void;
  query: string;
  t: RadarT;
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
          {t("hero.line1")}
          <br />
          {t("hero.line2")}
        </h1>
        <p>{t("hero.body")}</p>
        <label className="radar-search">
          <SearchIcon aria-hidden="true" size={17} />
          <span className="sr-only">{t("search.a11y")}</span>
          <input
            onChange={handleQueryChange}
            onCompositionEnd={handleCompositionEnd}
            onCompositionStart={() => setIsComposing(true)}
            placeholder={t("search.placeholder")}
            value={draftQuery}
          />
          {draftQuery ? (
            <button
              aria-label={t("actions.clearSearch")}
              className="radar-icon-button"
              onClick={handleClear}
              type="button"
            >
              <XIcon size={16} />
            </button>
          ) : null}
        </label>
      </div>
      <SignalPanel board={board} t={t} />
    </section>
  );
}

function SignalPanel({ board, t }: { board: RadarBoard; t: RadarT }) {
  return (
    <aside className="radar-signal">
      <h2>{t("signal.title")}</h2>
      <p>{t("signal.body")}</p>
      <div className="radar-mini-metrics">
        <Metric
          value={String(board.metrics.productHuntCount)}
          label={t("sources.productLaunches")}
        />
        <Metric
          value={String(board.metrics.githubCount)}
          label={t("sources.githubRepos")}
        />
        <Metric
          value={`${board.metrics.aiPercent}%`}
          label={t("metrics.aiRelated")}
        />
      </div>
    </aside>
  );
}

function Toolbar({
  categories,
  category,
  locale,
  onCategoryChange,
  onViewChange,
  t,
  view,
}: {
  categories: Array<{ count: number; label: string }>;
  category: string;
  locale: Locale;
  onCategoryChange: (category: string) => void;
  onViewChange: (view: RadarViewMode) => void;
  t: RadarT;
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
          {t("sources.all")}
        </button>
        {categories.map((item) => (
          <button
            className={`radar-pill ${category === item.label ? "active" : ""}`}
            key={item.label}
            onClick={() => onCategoryChange(item.label)}
            type="button"
          >
            {categoryLabel(item.label, t)} {item.count}
          </button>
        ))}
      </div>
      <div className="radar-tabs" aria-label={t("view.mode")}>
        <button
          className={`radar-pill ${view === "grid" ? "active" : ""}`}
          onClick={() => onViewChange("grid")}
          type="button"
        >
          <Grid2X2Icon aria-hidden="true" size={15} />
          {t("view.cards")}
        </button>
        <button
          className={`radar-pill ${view === "compact" ? "active" : ""}`}
          onClick={() => onViewChange("compact")}
          type="button"
        >
          <ListIcon aria-hidden="true" size={15} />
          {t("view.compact")}
        </button>
      </div>
    </div>
  );
}

function RadarSidebar({
  board,
  date,
  locale,
  onDateChange,
  t,
}: {
  board: RadarBoard;
  date: string;
  locale: Locale;
  onDateChange: (date: string) => void;
  t: RadarT;
}) {
  const quickDates = board.availableDates.slice(0, 5);
  const hasMoreDates = board.availableDates.length > quickDates.length;

  return (
    <aside className="radar-sidebar">
      <div className="radar-sidebar-card">
        <h3>{t("sources.contentSources")}</h3>
        <div className="radar-topic">
          <span>{t("sources.productHuntLaunches")}</span>
          <span>{board.metrics.productHuntCount}</span>
        </div>
        <div className="radar-topic">
          <span>{t("sources.githubRepos")}</span>
          <span>{board.metrics.githubCount}</span>
        </div>
        <div className="radar-topic">
          <span>{t("sources.crossSourceInsights")}</span>
          <span>{board.categories.slice(0, 3).length}</span>
        </div>
      </div>
      <div className="radar-sidebar-card">
        <h3>{t("date.label")}</h3>
        <div className="radar-date-list">
          {quickDates.map((item) => (
            <button
              className={`radar-pill ${date === item ? "active" : ""}`}
              key={item}
              onClick={() => onDateChange(item)}
              type="button"
            >
              {formatDateChipLabel(item, undefined, locale)} · {item.slice(5)}
            </button>
          ))}
          {hasMoreDates ? (
            <DatePicker
              availableDates={board.availableDates}
              date={date}
              label={t("date.more")}
              t={t}
              onDateChange={onDateChange}
            />
          ) : null}
        </div>
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
  t,
}: {
  availableDates: string[];
  className?: string;
  date: string;
  label: string;
  onDateChange: (date: string) => void;
  t: RadarT;
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
          {availableDates.length ? label : t("date.noDates")}
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
          <span>{t("date.footer")}</span>
          <strong>
            {availableDates.length} {t("date.unit")}
          </strong>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CardGrid({
  cards,
  locale,
  onOpen,
  t,
  view,
}: {
  cards: RadarCard[];
  locale: Locale;
  onOpen: (card: RadarCard) => void;
  t: RadarT;
  view: RadarViewMode;
}) {
  return (
    <section className={`radar-grid ${view === "compact" ? "compact" : ""}`}>
      {cards.map((card) => (
        <RadarCardView
          card={card}
          key={card.id}
          locale={locale}
          onOpen={() => onOpen(card)}
          t={t}
        />
      ))}
    </section>
  );
}

function RadarCardView({
  card,
  locale,
  onOpen,
  t,
}: {
  card: RadarCard;
  locale: Locale;
  onOpen: () => void;
  t: RadarT;
}) {
  const tags = primaryDisplayTags(card);

  return (
    <article className="radar-card">
      <Cover card={card} locale={locale} />
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
              {categoryLabel(tag, t)}
            </span>
          ))}
        </div>
        <Stats card={card} t={t} />
      </div>
      <button
        aria-label={t("card.open", { title: card.title })}
        className="radar-card-action"
        onClick={onOpen}
        type="button"
      />
    </article>
  );
}

function Cover({ card, locale }: { card: RadarCard; locale: Locale }) {
  const badge =
    card.type === "github" ? card.language || "GitHub" : "Product Hunt";
  const useSemanticCover =
    card.type === "github" && card.coverStyle === "semantic";

  return (
    <div
      className={`radar-cover ${card.type === "github" ? "repo" : ""} ${
        useSemanticCover ? "semantic" : ""
      }`}
    >
      {useSemanticCover ? (
        <SemanticCover card={card} locale={locale} />
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

function SemanticCover({ card, locale }: { card: RadarCard; locale: Locale }) {
  const model = semanticCoverModel(card, locale);
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

function Stats({ card, t }: { card: RadarCard; t: RadarT }) {
  if (card.type === "github") {
    return (
      <div className="radar-stats">
        <span>
          {formatCount(card.metrics.stars)} {t("metrics.stars")}
        </span>
        <span>
          {formatCount(card.metrics.forks)} {t("metrics.forks")}
        </span>
      </div>
    );
  }

  return (
    <div className="radar-stats">
      <span>
        {card.metrics.votes ?? 0} {t("metrics.votes")}
      </span>
      <span>
        {card.metrics.comments ?? 0} {t("metrics.comments")}
      </span>
    </div>
  );
}

export function DetailDrawer({
  card,
  locale = "zh-CN",
  onClose,
}: {
  card: RadarCard | null;
  locale?: Locale;
  onClose: () => void;
}) {
  useTranslation("radar");
  const t = useMemo(() => i18n.getFixedT(locale, "radar"), [locale]);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [displayedMedia, setDisplayedMedia] = useState<
    NonNullable<RadarCard["media"]>[number] | null
  >(null);
  const [imageLoadError, setImageLoadError] = useState(false);
  const [imageLoadRetry, setImageLoadRetry] = useState(0);
  const [imageIsLoading, setImageIsLoading] = useState(false);
  const loadedImageSrcs = useRef<Set<string>>(new Set());
  const imageLoadRequestId = useRef(0);
  const media = useMemo(
    () =>
      card?.media?.length
        ? card.media
        : card?.coverUrl
          ? [{ type: "image", url: card.coverUrl }]
          : [],
    [card?.coverUrl, card?.media],
  );
  const activeMedia = media[activeMediaIndex] ?? media[0];
  const heroMedia = displayedMedia ?? activeMedia;
  const secondaryTags = card ? secondaryDisplayTags(card) : [];
  const selectedCardId = card?.id;

  // biome-ignore lint/correctness/useExhaustiveDependencies: the card id is the reset signal for gallery state.
  useEffect(() => {
    setActiveMediaIndex(0);
    setDisplayedMedia(null);
    setImageLoadError(false);
    setImageIsLoading(false);
  }, [selectedCardId]);

  // imageLoadRetry intentionally retriggers preloading the same active media.
  // biome-ignore lint/correctness/useExhaustiveDependencies: retry increments must rerun this effect.
  useEffect(() => {
    const imageSrc = activeMedia?.videoUrl ? null : activeMedia?.url;
    const requestId = imageLoadRequestId.current + 1;
    imageLoadRequestId.current = requestId;
    setImageLoadError(false);

    if (!activeMedia) {
      setDisplayedMedia(null);
      setImageIsLoading(false);
      return;
    }

    if (!imageSrc) {
      setDisplayedMedia(activeMedia);
      setImageIsLoading(false);
      return;
    }

    const image = new Image();
    image.src = imageSrc;
    const loadState = getGalleryImageLoadState(
      imageSrc,
      loadedImageSrcs.current,
      image,
    );

    if (!loadState.shouldPreload) {
      loadedImageSrcs.current.add(imageSrc);
      setDisplayedMedia(activeMedia);
      setImageIsLoading(false);
      return;
    }

    const loadingTimer = window.setTimeout(() => {
      if (imageLoadRequestId.current === requestId) {
        setImageIsLoading(true);
      }
    }, galleryImageLoadingDelayMs);

    image.onload = () => {
      if (imageLoadRequestId.current !== requestId) {
        return;
      }
      window.clearTimeout(loadingTimer);
      loadedImageSrcs.current.add(imageSrc);
      setDisplayedMedia(activeMedia);
      setImageIsLoading(false);
    };
    image.onerror = () => {
      if (imageLoadRequestId.current !== requestId) {
        return;
      }
      window.clearTimeout(loadingTimer);
      setImageLoadError(true);
      setImageIsLoading(false);
    };

    return () => {
      window.clearTimeout(loadingTimer);
      image.onload = null;
      image.onerror = null;
    };
  }, [activeMedia, imageLoadRetry]);

  function changeMediaIndex(direction: -1 | 1) {
    setActiveMediaIndex(
      (currentIndex) =>
        (currentIndex + direction + media.length) % media.length,
    );
  }

  return (
    <aside
      aria-hidden={card ? "false" : "true"}
      className={`radar-drawer ${card ? "open" : ""}`}
    >
      <button
        aria-label={t("actions.closeDetail")}
        className="radar-close"
        onClick={onClose}
        type="button"
      >
        <XIcon size={17} />
      </button>
      {card ? (
        <div className="radar-drawer-inner">
          <div
            className={`radar-drawer-hero ${
              imageIsLoading ? "media-loading" : ""
            } ${imageLoadError ? "media-error" : ""}`}
          >
            {heroMedia ? (
              heroMedia.videoUrl ? (
                // biome-ignore lint/a11y/useMediaCaption: remote trend videos do not provide caption tracks.
                <video
                  controls
                  poster={heroMedia.url}
                  src={heroMedia.videoUrl}
                />
              ) : (
                <Zoom
                  a11yNameButtonUnzoom={t("actions.closeLargeImage")}
                  a11yNameButtonZoom={t("actions.zoomImage")}
                  ZoomContent={({ buttonUnzoom, img }) => (
                    <div className="radar-zoom-content">
                      {img}
                      {media.length > 1 ? (
                        <div className="radar-zoom-gallery-controls">
                          <button
                            aria-label={t("actions.previousLargeImage")}
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
                            aria-label={t("actions.nextLargeImage")}
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
                  <img src={heroMedia.url} alt={card.title} />
                </Zoom>
              )
            ) : card.coverStyle === "semantic" ? (
              <SemanticCover card={card} locale={locale} />
            ) : null}
            {imageIsLoading ? (
              <output
                aria-label={t("media.productImageLoading")}
                className="radar-gallery-loading"
              >
                <LoaderCircleIcon aria-hidden="true" size={18} />
              </output>
            ) : null}
            {imageLoadError ? (
              <output className="radar-gallery-error">
                <span>{t("media.imageLoadFailed")}</span>
                <button
                  aria-label={t("actions.retryImage")}
                  className="radar-gallery-button"
                  onClick={() => setImageLoadRetry((retry) => retry + 1)}
                  type="button"
                >
                  <RotateCcwIcon size={15} />
                </button>
              </output>
            ) : null}
            {media.length > 1 ? (
              <div className="radar-gallery-controls">
                <button
                  aria-label={t("actions.previousImage")}
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
                  aria-label={t("actions.nextImage")}
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
                <div className="radar-source">{card.sourceLabel}</div>
                <h2>{card.title}</h2>
              </div>
              <a
                className="radar-pill primary radar-drawer-title-action"
                href={card.sourceUrl}
                rel="noreferrer noopener"
                target="_blank"
              >
                <ExternalLinkIcon aria-hidden="true" size={15} />
                {t("actions.openSource")}
              </a>
            </div>
            <p>{card.description}</p>
            <div className="radar-tag-group">
              <div className="radar-tag-label">{t("tags.category")}</div>
              <div className="radar-tags">
                {card.categories.map((tag) => (
                  <span className="radar-tag" key={tag}>
                    {categoryLabel(tag, t)}
                  </span>
                ))}
              </div>
            </div>
            {secondaryTags.length ? (
              <div className="radar-tag-group">
                <div className="radar-tag-label">{t("tags.keywords")}</div>
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
              {drawerMetrics(card, t).map((metric) => (
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

function EmptyState({ date, t }: { date: string; t: RadarT }) {
  return (
    <div className="radar-empty">
      {date ? t("empty.withDate") : t("empty.noData")}
    </div>
  );
}

function drawerMetrics(card: RadarCard, t: RadarT) {
  if (card.type === "github") {
    return [
      { label: t("metrics.stars"), value: formatCount(card.metrics.stars) },
      { label: t("metrics.forks"), value: formatCount(card.metrics.forks) },
      { label: t("metrics.score"), value: String(card.metrics.score ?? "—") },
    ];
  }

  return [
    { label: t("metrics.votes"), value: String(card.metrics.votes ?? 0) },
    { label: t("metrics.comments"), value: String(card.metrics.comments ?? 0) },
    { label: t("metrics.rank"), value: `#${card.rank}` },
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
  locale: Locale = "zh-CN",
) {
  const targetDate = parseDateKey(date);
  const todayDate = parseDateKey(today);

  if (!targetDate || !todayDate) {
    return i18n.t("date.fallback", { lng: locale, ns: "radar" });
  }

  const dayDiff = Math.round(
    (todayDate.getTime() - targetDate.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return i18n.t("date.today", { lng: locale, ns: "radar" });
  }
  if (dayDiff === 1) {
    return i18n.t("date.yesterday", { lng: locale, ns: "radar" });
  }
  if (dayDiff === 2 && locale === "zh-CN") {
    return i18n.t("date.twoDaysAgo", { lng: locale, ns: "radar" });
  }
  if (dayDiff > 2 && dayDiff < 7) {
    return i18n.t("date.daysAgo", {
      count: dayDiff,
      lng: locale,
      ns: "radar",
    });
  }
  if (dayDiff === 2) {
    return i18n.t("date.daysAgo", {
      count: dayDiff,
      lng: locale,
      ns: "radar",
    });
  }

  return date.slice(5);
}

function categoryLabel(label: string, t: RadarT) {
  return t(`categories.${label}`, { defaultValue: label });
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

function semanticCoverModel(card: RadarCard, locale: Locale) {
  const text = [
    card.title,
    card.description,
    ...card.categories,
    ...card.keywords,
  ]
    .join(" ")
    .toLowerCase();

  if (
    text.includes("ocr") ||
    text.includes("document") ||
    text.includes("pdf")
  ) {
    const tone = "paper";
    return {
      icon: FileTextIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (
    text.includes("image") ||
    text.includes("图像") ||
    text.includes("生成")
  ) {
    const tone = "visual";
    return {
      icon: ImageIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (
    text.includes("ecommerce") ||
    text.includes("store") ||
    text.includes("商店")
  ) {
    const tone = "commerce";
    return {
      icon: ShoppingBagIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (
    text.includes("security") ||
    text.includes("privacy") ||
    text.includes("安全")
  ) {
    const tone = "secure";
    return {
      icon: ShieldCheckIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (
    text.includes("agent") ||
    text.includes("mcp") ||
    text.includes("workflow")
  ) {
    const tone = "agent";
    return {
      icon: BotIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (text.includes("model") || text.includes("llm") || text.includes("ai")) {
    const tone = "model";
    return {
      icon: SparklesIcon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  if (
    text.includes("api") ||
    text.includes("framework") ||
    text.includes("typescript")
  ) {
    const tone = "dev";
    return {
      icon: Code2Icon,
      kicker: semanticCoverText(tone, "kicker", locale),
      steps: semanticCoverSteps(tone, locale),
      title: semanticCoverText(tone, "title", locale),
      tone,
    };
  }

  const tone = "default";
  return {
    icon: BoxesIcon,
    kicker: semanticCoverText(tone, "kicker", locale),
    steps: semanticCoverSteps(tone, locale),
    title: semanticCoverText(tone, "title", locale),
    tone,
  };
}

type SemanticTone =
  | "agent"
  | "commerce"
  | "default"
  | "dev"
  | "model"
  | "paper"
  | "secure"
  | "visual";

function semanticCoverText(
  tone: SemanticTone,
  field: "kicker" | "title",
  locale: Locale,
) {
  return i18n.t(`semantic.${tone}.${field}`, { lng: locale, ns: "radar" });
}

function semanticCoverSteps(tone: SemanticTone, locale: Locale) {
  return i18n.t(`semantic.${tone}.steps`, {
    lng: locale,
    ns: "radar",
    returnObjects: true,
  }) as string[];
}
