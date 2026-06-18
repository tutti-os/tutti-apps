const T = {
  zh: {
    t_title: "开始使用 Tutti 👋",
    t_tag: "人与 Agent「同频」创造的地方。<br>上下文、文件、应用、任务，全部打通。",
    t_n1: "绑定 Agent", t_n2: "Agent 协作", t_n3: "试试内置应用",
    t_soon: "即将推出",
    t_h1: "先把你的 Agent 接进来",
    t_i1: "目前仅支持 Claude Code 和 Codex。更多 Agent 能力正在开发中 💻",
    t_s1a: "Claude Code 绑定流程", t_s1b: "Codex 绑定流程",
    t_b1a: "绑定 Claude Code", t_b1b: "绑定 Codex",
    t_note1: "绑定后就可以在 Tutti 里使用你的 Agent 啦。<b>无需终端，上手简单。不同 Agent 间交互体验一致。</b>",
    t_h2: "看看 Agent 怎么协作", t_st1: "Big @", t_st2: "任务管理",
    t_atdesc: "对话中打个 @，让 Agent 获取彼此的<b>会话、文件、任务</b>，带着上下文工作；也可以 @ 应用，让 Agent 使用。",
    t_at1: "@ 会话", t_at2: "@ 文件", t_at3: "@ 任务", t_at4: "@ 应用",
    t_atd1: "@ 另一个 Agent，共享会话上下文", t_atd2: "@ 文件，Agent 直接读取", t_atd3: "@ 任务，Agent 获取任务上下文", t_atd4: "@ 应用，让 Agent 调用应用能力",
    t_tl1: "🎯 你说目标，Agent 拆解执行",
    t_td1: "说你想做什么就行。接着再委派 Agent 自动拆成子任务，指定合适的 Agent 去执行。",
    t_gt1: "你设目标", t_gt2: "Agent 拆解", t_gt3: "Agent 执行",
    t_gd1: "输入你的目标描述", t_gd2: "Agent 自动拆解为子任务", t_gd3: "Agent 分工执行中",
    t_bg1: "去设置目标任务 →",
    t_tl2: "📡 全局任务管控",
    t_td2: "Agent 的消息、运行状态、异常，不用你盯着，也不会漏掉。",
    t_ct1: "需要你处理", t_ct2: "全局查看",
    t_cd1: "主动提醒 · 需要你确认或操作的事项", t_cd2: "常驻面板 · 按优先级 / Agent 筛选查看",
    t_bg2: "去任务面板看看 →",
    t_h3: "试试内置应用", t_st3: "自己用", t_st4: "Agent 用",
    t_appdesc: "内置一系列生产力应用，开箱即用。<span class=\"info-wrap\"><b>复用已有的 Agent 订阅</b> <span class=\"info-dot\">i</span><span class=\"info-tip\">可使用的应用能力取决于你已有的 Agent / 模型订阅</span></span>",
    t_apt1: "应用全景", t_apt2: "使用示例",
    t_apd1: "应用中心 · 全部应用一览", t_apd2: "单个应用的使用界面",
    t_bg3: "去应用中心看看 →",
    t_agappdesc: "Agent 可以直接 @ 应用完成任务，也能拿应用的产物继续工作。<b>不需要你手动搬运。</b>",
    t_agt1: "@ 应用完成任务", t_agt2: "使用应用产物",
    t_agd1: "Agent 在对话中 @ 应用，直接完成任务", t_agd2: "Agent 引用应用产物继续工作",
    t_end: "人与 Agent，同频共建",
    t_be1: "绑定 Agent，开始使用", t_be2: "已绑定，去使用 →"
  },
  en: {
    t_title: "Get Started with Tutti 👋",
    t_tag: "Where people and agents build in tune.<br>Tutti puts them in one live workspace: shared context, files, apps, and running tasks.",
    t_n1: "Set Up", t_n2: "Collaboration", t_n3: "Built-in Apps",
    t_soon: "Coming soon",
    t_h1: "Bring your agents in",
    t_i1: "Currently supports Claude Code and Codex. More agents on the way 💻",
    t_s1a: "Claude Code setup", t_s1b: "Codex setup",
    t_b1a: "Connect Claude Code", t_b1b: "Connect Codex",
    t_note1: "Once connected, use your agents right in Tutti. <b>No terminal needed, easy to start. Consistent experience across agents.</b>",
    t_h2: "See how agents collaborate", t_st1: "Big @", t_st2: "Task Management",
    t_atdesc: "Type @ in a conversation to let agents access each other's <b>chats, files, and tasks</b> with full context — or @ an app to put it to work.",
    t_at1: "@ Chats", t_at2: "@ Files", t_at3: "@ Tasks", t_at4: "@ Apps",
    t_atd1: "@ another agent to share conversation context", t_atd2: "@ a file for the agent to read directly", t_atd3: "@ a task to give the agent task context", t_atd4: "@ an app to let the agent use it",
    t_tl1: "🎯 You set the goal, agents do the rest",
    t_td1: "Just say what you want done. Then assign agents to break it into subtasks and pick the right one to execute.",
    t_gt1: "You set the goal", t_gt2: "Agent break down", t_gt3: "Run with Agent",
    t_gd1: "Enter your goal description", t_gd2: "Agent auto-decomposes into subtasks", t_gd3: "Agents executing in parallel",
    t_bg1: "Set a goal →",
    t_tl2: "📡 Unified task control",
    t_td2: "Agent messages, running status, errors — nothing slips through, no babysitting needed.",
    t_ct1: "Needs your action", t_ct2: "Full overview",
    t_cd1: "Proactive alerts · items that need your confirmation", t_cd2: "Dashboard · filter by priority or agent",
    t_bg2: "View task panel →",
    t_h3: "Try the built-in apps", t_st3: "Use yourself", t_st4: "Agents use",
    t_appdesc: "Built-in productivity apps, ready to go. <span class=\"info-wrap\"><b>Powered by your existing subscriptions</b> <span class=\"info-dot\">i</span><span class=\"info-tip\">Available capabilities depend on your Agent / model subscriptions</span></span>",
    t_apt1: "All apps", t_apt2: "Example",
    t_apd1: "App Center · full app catalog", t_apd2: "A single app in action",
    t_bg3: "Check out App Center →",
    t_agappdesc: "Agents can @ apps directly in conversations, and use app outputs to keep working. <b>No manual transfers.</b>",
    t_agt1: "@ an app to complete tasks", t_agt2: "Use app outputs",
    t_agd1: "Agent @ an app in conversation to get things done", t_agd2: "Agent picks up app outputs and keeps working",
    t_end: "People and agents, building in tune",
    t_be1: "Connect agents to get started", t_be2: "Already connected, let's go →"
  }
};

let lang = "zh";

function applyLanguage(nextLang) {
  lang = nextLang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  const dictionary = T[lang];
  Object.keys(dictionary).forEach((key) => {
    const element = document.getElementById(key);
    if (!element) return;
    if (dictionary[key].includes("<")) {
      element.innerHTML = dictionary[key];
    } else {
      element.textContent = dictionary[key];
    }
  });
  document.querySelectorAll(".tab-btn.soon").forEach((element) => {
    element.dataset.soon = dictionary.t_soon;
  });
}

async function readHostLocale() {
  const appContext = window.tutti?.appContext || window.tuttiAppContext;
  try {
    if (typeof appContext?.get === "function") {
      const context = await appContext.get();
      return context?.locale || context?.language || null;
    }
    if (typeof appContext?.getLocale === "function") {
      return await appContext.getLocale();
    }
  } catch {
    return null;
  }
  return null;
}

function subscribeHostLocale(listener) {
  const appContext = window.tutti?.appContext || window.tuttiAppContext;
  if (typeof appContext?.subscribe === "function") {
    return appContext.subscribe((context) => listener(context?.locale || context?.language || null));
  }
  if (typeof appContext?.onLocaleChanged === "function") {
    return appContext.onLocaleChanged(listener);
  }
  return () => {};
}

function localeToLang(locale) {
  return String(locale || "").toLowerCase().startsWith("zh") ? "zh" : "en";
}

function bindTabs(rootSelector, buttonSelector, paneSelector, indexAttr) {
  document.querySelectorAll(rootSelector).forEach((root) => {
    const buttons = root.querySelectorAll(buttonSelector);
    const panes = root.querySelectorAll(paneSelector);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset[indexAttr]);
        buttons.forEach((item) => item.classList.remove("on"));
        panes.forEach((item) => item.classList.remove("on"));
        button.classList.add("on");
        if (panes[index]) panes[index].classList.add("on");
      });
    });
  });
}

function bindSectionTabs() {
  document.querySelectorAll("[data-sectabs]").forEach((root) => {
    const key = root.dataset.sectabs;
    const buttons = root.querySelectorAll(".sec-tab");
    const panes = document.querySelector(`[data-sp="${key}"]`)?.querySelectorAll(":scope > .sec-pane") || [];
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const index = Number(button.dataset.st);
        buttons.forEach((item) => item.classList.remove("on"));
        panes.forEach((item) => item.classList.remove("on"));
        button.classList.add("on");
        if (panes[index]) panes[index].classList.add("on");
      });
    });
  });
}

async function openAction(button) {
  const action = button.dataset.action;
  const workspace = window.tutti?.workspace;
  if (typeof workspace?.openFeature !== "function") return;
  if (action === "agent-connect") {
    // 直接拉起绑定/使用 Agent，不跳设置面板；默认 Codex。
    await workspace.openFeature({
      feature: "agent-connect",
      provider: button.dataset.provider || "codex"
    });
    return;
  }
  if (action === "agent-chat") {
    // 打开已绑定的 Agent 对话框（由宿主选择默认/已绑定 provider）。
    await workspace.openFeature({ feature: "agent-chat" });
    return;
  }
  if (
    action === "app-center" ||
    action === "issue-manager" ||
    action === "message-center"
  ) {
    await workspace.openFeature({ feature: action });
  }
}

document.querySelectorAll(".nav-btn[data-scroll]").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById(button.dataset.scroll)?.scrollIntoView({ behavior: "smooth" });
  });
});

document.querySelectorAll(".btn[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    openAction(button).catch(() => {});
  });
});

// 预解码所有 demo 图片，切换 tab 时直接命中缓存、不再闪烁。
function preloadShots() {
  document.querySelectorAll(".shot img").forEach((img) => {
    const source = img.currentSrc || img.getAttribute("src");
    if (!source) return;
    const preload = new Image();
    preload.decoding = "async";
    preload.src = source;
    if (typeof preload.decode === "function") {
      preload.decode().catch(() => {});
    }
  });
}
preloadShots();

bindTabs("[data-tabs]", ".tab-btn:not(.soon)", ":scope > .tab-pane", "t");
bindSectionTabs();

// 点击截图查看大图（灯箱）
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightboxImg");
function openLightbox(source, alt) {
  if (!lightbox || !lightboxImg || !source) return;
  lightboxImg.src = source;
  lightboxImg.alt = alt || "";
  lightbox.hidden = false;
}
function closeLightbox() {
  if (!lightbox || lightbox.hidden) return;
  lightbox.hidden = true;
  lightboxImg.removeAttribute("src");
}
document.querySelectorAll(".shot img").forEach((img) => {
  img.addEventListener("click", () => {
    openLightbox(img.currentSrc || img.getAttribute("src"), img.alt);
  });
});
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox || event.target.closest(".lightbox-close")) {
    closeLightbox();
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

// 视频：中央播放按钮蒙层 + 原生控制条（播放/暂停/进度条）
document.querySelectorAll(".shot-video").forEach((wrap) => {
  const video = wrap.querySelector("video");
  const playButton = wrap.querySelector(".video-play");
  if (!video) return;
  const toggle = () => {
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };
  playButton?.addEventListener("click", toggle);
  video.addEventListener("play", () => wrap.classList.add("playing"));
  video.addEventListener("pause", () => wrap.classList.remove("playing"));
  video.addEventListener("ended", () => wrap.classList.remove("playing"));
});

const navButtons = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".sec");
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeId = entry.target.id;
    navButtons.forEach((button, index) => {
      button.classList.toggle("on", ["s1", "s2", "s3"][index] === activeId);
    });
  });
}, { threshold: .3, rootMargin: "-96px 0px -40% 0px" });
sections.forEach((section) => observer.observe(section));

readHostLocale().then((locale) => applyLanguage(localeToLang(locale || navigator.language)));
subscribeHostLocale((locale) => applyLanguage(localeToLang(locale || navigator.language)));
