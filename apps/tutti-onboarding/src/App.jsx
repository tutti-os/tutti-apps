import { useEffect, useRef, useState } from "react";
import { Trans, useTranslation } from "react-i18next";

import i18n from "./i18n";
import { useAppLocale } from "./i18n/app-context";

const agentTabs = [
  { label: "Claude Code", image: "/assets/bind-claude.webp", altKey: "t_s1a" },
  { label: "Codex", image: "/assets/bind-codex.webp", altKey: "t_s1b" },
  { label: "Hermes Agent", soon: true },
  { label: "OpenClaw", soon: true },
  { label: "Gemini", soon: true },
];

const atTabs = [
  { labelKey: "t_at1", image: "/assets/at-chat.webp", altKey: "t_atd1" },
  { labelKey: "t_at2", image: "/assets/at-file.webp", altKey: "t_atd2" },
  { labelKey: "t_at3", image: "/assets/at-task.webp", altKey: "t_atd3" },
  { labelKey: "t_at4", image: "/assets/at-app.webp", altKey: "t_atd4" },
];

const goalTabs = [
  { labelKey: "t_gt1", image: "/assets/goal-set.webp", altKey: "t_gd1" },
  {
    labelKey: "t_gt2",
    image: "/assets/goal-breakdown.webp",
    altKey: "t_gd2",
  },
  { labelKey: "t_gt3", image: "/assets/goal-run.webp", altKey: "t_gd3" },
];

const controlTabs = [
  {
    labelKey: "t_ct1",
    image: "/assets/control-waiting.webp",
    altKey: "t_cd1",
  },
  {
    labelKey: "t_ct2",
    image: "/assets/control-overview.webp",
    altKey: "t_cd2",
  },
];

const appTabs = [
  {
    labelKey: "t_apt1",
    image: "/assets/apps-overview.webp",
    altKey: "t_apd1",
  },
  {
    labelKey: "t_apt2",
    image: "/assets/apps-example.webp",
    altKey: "t_apd2",
  },
];

const sectionIcons = {
  setup: "/assets/icon-electric-plug.png",
  collaboration: "/assets/icon-satellite-antenna.png",
  task: "/assets/icon-clipboard.png",
  control: "/assets/icon-joystick.png",
  apps: "/assets/icon-toolbox.png",
};

function HtmlText({ as: Tag = "p", className, i18nKey }) {
  return (
    <Tag className={className}>
      <Trans
        components={{
          bold: <b />,
          br: <br />,
          dot: <span className="info-dot" />,
          info: <span className="info-wrap" />,
          tip: <span className="info-tip" />,
          wave: (
            <img
              alt=""
              aria-hidden="true"
              className="title-wave"
              src="/assets/tone-light.png"
            />
          ),
        }}
        i18nKey={i18nKey}
      />
    </Tag>
  );
}

function IconImage({ alt = "", className, src }) {
  return <img alt={alt} className={className} src={src} />;
}

function openAction(action, provider) {
  const workspace = window.tuttiExternal?.workspace;
  if (typeof workspace?.openFeature !== "function") return Promise.resolve();

  if (action === "agent-connect") {
    return workspace.openFeature({
      feature: "agent-connect",
      provider: provider || "codex",
    });
  }

  if (action === "agent-chat") {
    return workspace.openFeature({ feature: "agent-chat" });
  }

  if (
    action === "app-center" ||
    action === "issue-manager" ||
    action === "message-center"
  ) {
    return workspace.openFeature({ feature: action });
  }

  return Promise.resolve();
}

function ActionButton({ action, children, className, provider }) {
  return (
    <button
      className={className}
      data-action={action}
      data-provider={provider}
      type="button"
      onClick={() => {
        openAction(action, provider).catch(() => {});
      }}
    >
      <span>{children}</span>
    </button>
  );
}

function ShotImage({ altKey, onOpen, src }) {
  const { t } = useTranslation();
  const alt = t(altKey);

  return (
    <button
      className="shot"
      type="button"
      onClick={() => {
        onOpen(src, alt);
      }}
    >
      <img alt={alt} src={src} />
    </button>
  );
}

function Tabs({ initialActive = 0, items, onOpen, variant = "underline" }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(initialActive);

  return (
    <div className={`tabs tabs-${variant}`} data-tabs>
      <div className="tab-bar">
        {items.map((item, index) => {
          const isActive = active === index && !item.soon;
          const className = [
            "tab-btn",
            isActive ? "on" : "",
            item.soon ? "soon" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              aria-disabled={item.soon ? "true" : undefined}
              className={className}
              data-soon={item.soon ? t("t_soon") : undefined}
              data-t={item.soon ? undefined : index}
              key={`${item.label || item.labelKey}-${index}`}
              type="button"
              onClick={() => {
                if (!item.soon) setActive(index);
              }}
            >
              <span>{item.label || t(item.labelKey)}</span>
            </button>
          );
        })}
      </div>
      {items
        .filter((item) => !item.soon)
        .map((item, index) => (
          <div
            className={`tab-pane${active === index ? " on" : ""}`}
            key={item.image || item.altKey}
          >
            <ShotImage altKey={item.altKey} onOpen={onOpen} src={item.image} />
          </div>
        ))}
    </div>
  );
}

function SectionTabs({ active, items, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="sec-tabs">
      {items.map((item, index) => (
        <button
          className={`sec-tab${active === index ? " on" : ""}`}
          data-st={index}
          key={item.labelKey}
          type="button"
          onClick={() => onChange(index)}
        >
          {item.icon ? <span>{item.icon}</span> : null}
          <b>{t(item.labelKey)}</b>
        </button>
      ))}
    </div>
  );
}

function VideoPane() {
  const { t } = useTranslation();
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef(null);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div className={`shot shot-video${playing ? " playing" : ""}`}>
      <video
        aria-label={t("t_agd1")}
        controls
        controlsList="nodownload"
        loop
        muted
        playsInline
        preload="metadata"
        ref={videoRef}
        src="/assets/apps-agent.mp4"
        onEnded={() => setPlaying(false)}
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        aria-label={t("t_play_pause")}
        className="video-play"
        type="button"
        onClick={toggle}
      >
        <span>▶</span>
      </button>
    </div>
  );
}

function AgentAppTabs() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const items = [
    { labelKey: "t_agt1", pane: <VideoPane /> },
    {
      labelKey: "t_agt2",
      pane: (
        <div className="shot shot-empty">
          <span>🖼</span>
          <span>{t("t_agd2")}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="tabs" data-tabs>
      <div className="tab-bar">
        {items.map((item, index) => (
          <button
            className={`tab-btn${active === index ? " on" : ""}`}
            data-t={index}
            key={item.labelKey}
            type="button"
            onClick={() => setActive(index)}
          >
            <span>{t(item.labelKey)}</span>
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          className={`tab-pane${active === index ? " on" : ""}`}
          key={item.labelKey}
        >
          {item.pane}
        </div>
      ))}
    </div>
  );
}

function Lightbox({ image, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!image) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [image, onClose]);

  return (
    <div
      className="lightbox"
      hidden={!image}
      id="lightbox"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <img
        alt={image?.alt || ""}
        className="lightbox-img"
        id="lightboxImg"
        src={image?.src || ""}
      />
      <button
        aria-label={t("t_close")}
        className="lightbox-close"
        id="lightboxClose"
        type="button"
        onClick={onClose}
      >
        ×
      </button>
    </div>
  );
}

export default function App() {
  const { t } = useTranslation();
  const locale = useAppLocale();
  const [activeSection, setActiveSection] = useState("s1");
  const [section3Tab, setSection3Tab] = useState(0);
  const [lightbox, setLightbox] = useState(null);
  const [isNavStuck, setIsNavStuck] = useState(false);
  const navRef = useRef(null);
  const navTopRef = useRef(0);
  const navHeightRef = useRef(0);
  const isNavStuckRef = useRef(false);

  useEffect(() => {
    void i18n.changeLanguage(locale);
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    document.title = t("t_doc_title");
  }, [t]);

  useEffect(() => {
    for (const img of document.querySelectorAll(".shot img")) {
      const source = img.currentSrc || img.getAttribute("src");
      if (!source) continue;
      const preload = new Image();
      preload.decoding = "async";
      preload.src = source;
      if (typeof preload.decode === "function") {
        preload.decode().catch(() => {});
      }
    }
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll(".sec");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { threshold: 0.3, rootMargin: "-96px 0px -40% 0px" },
    );

    for (const section of sections) {
      observer.observe(section);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const measureNavBounds = () => {
      const nav = navRef.current;
      if (!nav) return;
      navTopRef.current = nav.offsetTop;
      if (!isNavStuckRef.current) {
        navHeightRef.current = nav.offsetHeight;
      }
    };

    const updateNavStuck = () => {
      const nav = navRef.current;
      const navBottom = navTopRef.current + navHeightRef.current;
      const currentHeight = nav?.offsetHeight || navHeightRef.current;
      const compactDelta = Math.max(0, navHeightRef.current - currentHeight);
      const shouldStick = isNavStuckRef.current
        ? window.scrollY >= navBottom - compactDelta
        : window.scrollY >= navBottom;

      if (shouldStick === isNavStuckRef.current) return;
      isNavStuckRef.current = shouldStick;
      setIsNavStuck(shouldStick);
    };

    const handleResize = () => {
      measureNavBounds();
      updateNavStuck();
    };

    measureNavBounds();
    updateNavStuck();
    window.addEventListener("scroll", updateNavStuck, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", updateNavStuck);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const openLightbox = (src, alt) => setLightbox({ src, alt });
  const closeLightbox = () => setLightbox(null);
  const navItems = [
    {
      id: "s1",
      icon: sectionIcons.setup,
      labelKey: "t_n1",
      tone: "var(--accent-codex)",
    },
    {
      id: "s2",
      icon: sectionIcons.collaboration,
      labelKey: "t_n2",
      tone: "var(--accent-claude)",
    },
    {
      id: "s3",
      icon: sectionIcons.task,
      labelKey: "t_n3",
      tone: "var(--accent-claude)",
    },
    {
      id: "s4",
      icon: sectionIcons.control,
      labelKey: "t_n4",
      tone: "var(--accent-claude)",
    },
    {
      id: "s5",
      icon: sectionIcons.apps,
      labelKey: "t_n5",
      tone: "var(--tutti-purple)",
    },
  ];

  return (
    <>
      <main className="page">
        <header className="hero">
          <HtmlText as="h1" i18nKey="t_title" />
          <HtmlText className="tag" i18nKey="t_tag" />
        </header>

        <nav
          aria-label={t("t_nav_label")}
          className={`nav${isNavStuck ? " stuck" : ""}`}
          ref={navRef}
        >
          {navItems.map((item) => (
            <button
              className={`nav-btn${activeSection === item.id ? " on" : ""}`}
              data-scroll={item.id}
              key={item.id}
              style={{ "--tone": item.tone }}
              type="button"
              onClick={() => {
                document
                  .getElementById(item.id)
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <IconImage className="nav-ico" src={item.icon} />
              <b className="nav-title">{t(item.labelKey)}</b>
            </button>
          ))}
        </nav>

        <section
          className="sec"
          id="s1"
          style={{
            "--tone": "var(--accent-codex)",
            "--tone-fg": "var(--white-stationary)",
          }}
        >
          <div className="sec-h">
            <IconImage className="sec-ico" src={sectionIcons.setup} />
            <h2>{t("t_h1")}</h2>
          </div>
          <HtmlText className="sec-intro" i18nKey="t_i1" />
          <Tabs items={agentTabs} onOpen={openLightbox} variant="segment" />
          <div className="btns">
            <ActionButton
              action="agent-connect"
              className="btn ghost"
              provider="claude-code"
            >
              {t("t_b1a")}
            </ActionButton>
            <ActionButton
              action="agent-connect"
              className="btn ghost"
              provider="codex"
            >
              {t("t_b1b")}
            </ActionButton>
          </div>
        </section>

        <section
          className="sec"
          id="s2"
          style={{
            "--tone": "var(--accent-claude)",
            "--tone-fg": "var(--white-stationary)",
          }}
        >
          <div className="sec-h">
            <IconImage className="sec-ico" src={sectionIcons.collaboration} />
            <h2>{t("t_h2")}</h2>
          </div>
          <HtmlText className="sec-intro" i18nKey="t_atdesc" />
          <div className="sec-panes">
            <div className="sec-pane on">
              <Tabs
                initialActive={3}
                items={atTabs}
                onOpen={openLightbox}
                variant="segment"
              />
            </div>
          </div>
        </section>

        <section
          className="sec"
          id="s3"
          style={{
            "--tone": "var(--accent-claude)",
            "--tone-fg": "var(--white-stationary)",
          }}
        >
          <div className="sec-h">
            <IconImage className="sec-ico" src={sectionIcons.task} />
            <h2>{t("t_st2")}</h2>
          </div>
          <HtmlText className="sec-intro" i18nKey="t_td1" />
          <article className="task">
            <Tabs items={goalTabs} onOpen={openLightbox} variant="segment" />
            <div className="btns">
              <ActionButton action="issue-manager" className="btn ghost">
                {t("t_bg1")}
              </ActionButton>
            </div>
          </article>
        </section>

        <section
          className="sec"
          id="s4"
          style={{
            "--tone": "var(--accent-claude)",
            "--tone-fg": "var(--white-stationary)",
          }}
        >
          <div className="sec-h">
            <IconImage className="sec-ico" src={sectionIcons.control} />
            <h2>{t("t_tl2")}</h2>
          </div>
          <HtmlText className="sec-intro" i18nKey="t_td2" />
          <Tabs items={controlTabs} onOpen={openLightbox} variant="segment" />
          <div className="btns">
            <ActionButton action="message-center" className="btn ghost">
              {t("t_bg2")}
            </ActionButton>
          </div>
        </section>

        <section
          className="sec"
          id="s5"
          style={{
            "--tone": "var(--tutti-purple)",
            "--tone-fg": "var(--white-stationary)",
          }}
        >
          <div className="sec-h">
            <IconImage className="sec-ico" src={sectionIcons.apps} />
            <h2>{t("t_h3")}</h2>
          </div>
          <HtmlText
            className="sec-intro"
            i18nKey={section3Tab === 0 ? "t_appdesc" : "t_agappdesc"}
          />
          <SectionTabs
            active={section3Tab}
            items={[
              { labelKey: "t_st3" },
              { labelKey: "t_st4" },
            ]}
            onChange={setSection3Tab}
          />
          <div className="sec-panes">
            <div className={`sec-pane${section3Tab === 0 ? " on" : ""}`}>
              <Tabs items={appTabs} onOpen={openLightbox} />
              <div className="btns">
                <ActionButton action="app-center" className="btn ghost">
                  {t("t_bg3")}
                </ActionButton>
              </div>
            </div>
            <div className={`sec-pane${section3Tab === 1 ? " on" : ""}`}>
              <AgentAppTabs />
            </div>
          </div>
        </section>

        <footer className="end">
          <IconImage
            alt="Tutti"
            className="end-logo"
            src="/assets/logo1.png"
          />
          <h2>{t("t_end")}</h2>
          <div className="btns center">
            <ActionButton
              action="agent-connect"
              className="btn blue"
              provider="codex"
            >
              {t("t_be1")}
            </ActionButton>
            <ActionButton action="agent-chat" className="btn ghost">
              {t("t_be2")}
            </ActionButton>
          </div>
        </footer>
      </main>
      <Lightbox image={lightbox} onClose={closeLightbox} />
    </>
  );
}
