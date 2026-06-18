import i18next from "i18next";
import React from "react";
import { createRoot } from "react-dom/client";
import { I18nextProvider, useTranslation } from "react-i18next";
import "./styles.css";

const media = {
  panorama: "/assets/应用-全景图.webp",
  appExample: "/assets/应用-示例.webp",
  codex: "/assets/绑定agent-codex.webp",
  claude: "/assets/绑定agent- Claude code.webp",
  taskSplit: "/assets/agent协作-任务拆解.webp",
  taskRun: "/assets/agent协作-任务执行.webp",
  mentionApp: "/assets/agent协作-@应用.webp",
  mentionFile: "/assets/agent协作-@文件.webp",
  mentionTask: "/assets/agent协作-@任务.webp",
  needsUser: "/assets/agent协作-需要用户处理.webp",
  video: "/assets/应用-agent用-@应用.mp4",
};

const resources = {
  "zh-CN": {
    translation: {
      heroTitle: "Tutti 入门导览",
      heroText:
        "从安装 agent 插件、绑定 Codex 或 Claude Code，到在工作区里用 @ 应用、@ 文件和任务拆解完成协作。",
      openChecklist: "发布前检查",
      installPlugin: "安装 Tutti agent 插件",
      installPluginText:
        "插件提供 Tutti app package 规范、运行时入口、CLI 能力和发布校验规则。",
      bindAgent: "绑定本地 agent",
      bindAgentText:
        "把 Codex 或 Claude Code 接入 Tutti 后，应用可以在本地工作区里被 agent 调用和协作。",
      collaborate: "在任务里协作",
      collaborateText:
        "用 @ 应用、@ 文件、@ 会话和任务状态把上下文交给 agent，让执行过程可追踪。",
      cliTitle: "CLI 能力",
      cliText:
        "打包后提供 onboarding status 命令，其他 Tutti app 和 agent 可以查询导览状态。",
      sectionsTitle: "导览流程",
      galleryTitle: "关键界面",
      videoTitle: "Agent 使用 @ 应用",
      statusReady:
        "可发布 package 已包含 manifest、bootstrap、server 和 CLI manifest。",
      language: "English",
    },
  },
  "en-US": {
    translation: {
      heroTitle: "Tutti Onboarding",
      heroText:
        "A guided tour for installing the agent plugin, binding Codex or Claude Code, and collaborating with apps, files, and tasks inside a workspace.",
      openChecklist: "Publish checklist",
      installPlugin: "Install the Tutti agent plugin",
      installPluginText:
        "The plugin provides Tutti app package contracts, runtime entrypoints, CLI capabilities, and publish validation rules.",
      bindAgent: "Bind a local agent",
      bindAgentText:
        "Connect Codex or Claude Code so Tutti apps can be called and assisted by agents in the local workspace.",
      collaborate: "Collaborate in tasks",
      collaborateText:
        "Use app mentions, file mentions, conversation context, and task states to make agent work traceable.",
      cliTitle: "CLI capability",
      cliText:
        "The package exposes onboarding status so other Tutti apps and agents can discover the guide.",
      sectionsTitle: "Guide flow",
      galleryTitle: "Key screens",
      videoTitle: "Agent uses an app mention",
      statusReady:
        "The publishable package includes manifest, bootstrap, server, and CLI manifest files.",
      language: "中文",
    },
  },
};

await i18next.init({
  fallbackLng: "zh-CN",
  lng: navigator.language?.startsWith("zh") ? "zh-CN" : "en-US",
  resources,
});

function useLanguageToggle() {
  const { i18n } = useTranslation();
  return () => {
    i18n.changeLanguage(i18n.language === "zh-CN" ? "en-US" : "zh-CN");
  };
}

function App() {
  const { t } = useTranslation();
  const toggleLanguage = useLanguageToggle();

  const steps = [
    [t("installPlugin"), t("installPluginText"), media.appExample],
    [t("bindAgent"), t("bindAgentText"), media.codex],
    [t("collaborate"), t("collaborateText"), media.mentionApp],
    [t("cliTitle"), t("cliText"), media.taskRun],
  ];

  const gallery = [
    media.panorama,
    media.claude,
    media.taskSplit,
    media.mentionFile,
    media.mentionTask,
    media.needsUser,
  ];

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Tutti Workspace App</p>
          <h1>{t("heroTitle")}</h1>
          <p>{t("heroText")}</p>
          <div className="hero-actions">
            <a href="#checklist">{t("openChecklist")}</a>
            <button type="button" onClick={toggleLanguage}>
              {t("language")}
            </button>
          </div>
        </div>
        <img src={media.panorama} alt="" />
      </section>

      <section className="section" id="checklist">
        <div className="section-heading">
          <p className="eyebrow">{t("statusReady")}</p>
          <h2>{t("sectionsTitle")}</h2>
        </div>
        <div className="steps">
          {steps.map(([title, text, image]) => (
            <article className="step" key={title}>
              <img src={image} alt="" loading="lazy" />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section media-section">
        <div className="section-heading">
          <h2>{t("videoTitle")}</h2>
        </div>
        <video controls muted playsInline poster={media.mentionApp}>
          <source src={media.video} type="video/mp4" />
        </video>
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>{t("galleryTitle")}</h2>
        </div>
        <div className="gallery">
          {gallery.map((image) => (
            <img src={image} alt="" loading="lazy" key={image} />
          ))}
        </div>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(
  <I18nextProvider i18n={i18next}>
    <App />
  </I18nextProvider>,
);
