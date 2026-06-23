interface Env {
  GITHUB_WEBHOOK_SECRET: string;
  FEISHU_BOT_WEBHOOK: string;
  FEISHU_BOT_SIGN_KEY?: string;
  GITHUB_TOKEN?: string;
  ORG_LOGIN: string;
  ENVIRONMENT: string;
  DELIVERIES?: KVNamespace;
}

type GitHubEvent =
  | "issues"
  | "pull_request"
  | "issue_comment"
  | "pull_request_review"
  | "pull_request_review_comment";

const SUPPORTED_EVENTS = new Set<GitHubEvent>([
  "issues",
  "pull_request",
  "issue_comment",
  "pull_request_review",
  "pull_request_review_comment"
]);

const SUPPORTED_ACTIONS = new Set([
  "opened",
  "reopened",
  "ready_for_review",
  "created",
  "submitted"
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "tutti-github-feishu-notifier" });
    }

    if (request.method !== "POST" || !["/", "/github"].includes(url.pathname)) {
      return json({ error: "not_found" }, 404);
    }

    const event = request.headers.get("x-github-event") ?? "";
    if (!SUPPORTED_EVENTS.has(event as GitHubEvent)) {
      return json({ ok: true, ignored: "unsupported_event", event });
    }

    const deliveryId = request.headers.get("x-github-delivery") ?? "";
    if (deliveryId && env.DELIVERIES) {
      const existing = await env.DELIVERIES.get(deliveryId);
      if (existing) {
        return json({ ok: true, ignored: "duplicate_delivery" });
      }
    }

    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256") ?? "";
    const valid = await verifyGitHubSignature(rawBody, signature, env.GITHUB_WEBHOOK_SECRET);
    if (!valid) {
      return json({ error: "invalid_signature" }, 401);
    }

    const payload = JSON.parse(rawBody);
    if (!SUPPORTED_ACTIONS.has(payload.action)) {
      return json({ ok: true, ignored: "unsupported_action", action: payload.action });
    }

    const notification = extractNotification(event as GitHubEvent, payload);
    if (!notification) {
      return json({ ok: true, ignored: "no_notification" });
    }

    if (isBot(notification.senderLogin, notification.senderType)) {
      return json({ ok: true, ignored: "bot_sender" });
    }

    const external = await isExternalContributor(env, notification);
    if (!external) {
      return json({ ok: true, ignored: "internal_contributor" });
    }

    await sendFeishuCard(env, notification);

    if (deliveryId && env.DELIVERIES) {
      await env.DELIVERIES.put(deliveryId, "1", { expirationTtl: 60 * 60 * 24 });
    }

    return json({ ok: true, notified: true });
  }
};

interface Notification {
  event: GitHubEvent;
  action: string;
  repoFullName: string;
  repoUrl: string;
  orgLogin: string;
  senderLogin: string;
  senderType?: string;
  authorAssociation?: string;
  title: string;
  number?: number;
  htmlUrl: string;
  checksUrl?: string;
  authorUrl: string;
  summary: string;
}

function extractNotification(event: GitHubEvent, payload: any): Notification | null {
  const repo = payload.repository;
  if (!repo?.full_name || !repo?.html_url) {
    return null;
  }

  const base = {
    event,
    action: payload.action,
    repoFullName: repo.full_name,
    repoUrl: repo.html_url,
    orgLogin: repo.owner?.login ?? repo.full_name.split("/")[0],
    senderLogin: payload.sender?.login ?? "unknown",
    senderType: payload.sender?.type,
    authorUrl: payload.sender?.html_url ?? `https://github.com/${payload.sender?.login ?? ""}`
  };

  if (event === "pull_request") {
    const pr = payload.pull_request;
    return {
      ...base,
      authorAssociation: pr.author_association,
      title: `[Github 外部 PR] ${repo.full_name}#${pr.number} ${pr.title}`,
      number: pr.number,
      htmlUrl: pr.html_url,
      checksUrl: `${pr.html_url}/checks`,
      summary: summarize(pr.body)
    };
  }

  if (event === "issues") {
    const issue = payload.issue;
    return {
      ...base,
      authorAssociation: issue.author_association,
      title: `[Github 外部 Issue] ${repo.full_name}#${issue.number} ${issue.title}`,
      number: issue.number,
      htmlUrl: issue.html_url,
      summary: summarize(issue.body)
    };
  }

  if (event === "issue_comment") {
    const issue = payload.issue;
    const kind = issue.pull_request ? "PR 评论" : "Issue 评论";
    return {
      ...base,
      authorAssociation: payload.comment?.author_association,
      title: `[Github 外部${kind}] ${repo.full_name}#${issue.number} ${issue.title}`,
      number: issue.number,
      htmlUrl: payload.comment?.html_url ?? issue.html_url,
      summary: summarize(payload.comment?.body)
    };
  }

  if (event === "pull_request_review") {
    const pr = payload.pull_request;
    return {
      ...base,
      authorAssociation: payload.review?.author_association,
      title: `[Github 外部评审] ${repo.full_name}#${pr.number} ${pr.title}`,
      number: pr.number,
      htmlUrl: payload.review?.html_url ?? pr.html_url,
      summary: summarize(payload.review?.body || payload.review?.state)
    };
  }

  if (event === "pull_request_review_comment") {
    const pr = payload.pull_request;
    return {
      ...base,
      authorAssociation: payload.comment?.author_association,
      title: `[Github 外部评审评论] ${repo.full_name}#${pr.number} ${pr.title}`,
      number: pr.number,
      htmlUrl: payload.comment?.html_url ?? pr.html_url,
      summary: summarize(payload.comment?.body)
    };
  }

  return null;
}

async function isExternalContributor(env: Env, notification: Notification): Promise<boolean> {
  const association = notification.authorAssociation ?? "";
  if (["OWNER", "MEMBER", "COLLABORATOR"].includes(association)) {
    return false;
  }

  if (!env.GITHUB_TOKEN) {
    return true;
  }

  const headers = {
    accept: "application/vnd.github+json",
    authorization: `Bearer ${env.GITHUB_TOKEN}`,
    "user-agent": "tutti-github-feishu-notifier"
  };

  const member = await fetch(
    `https://api.github.com/orgs/${notification.orgLogin}/members/${notification.senderLogin}`,
    { headers }
  );
  if (member.status === 204) {
    return false;
  }

  const collaborator = await fetch(
    `https://api.github.com/repos/${notification.repoFullName}/collaborators/${notification.senderLogin}`,
    { headers }
  );
  return collaborator.status !== 204;
}

function isBot(login: string, type?: string): boolean {
  return type === "Bot" || login.endsWith("[bot]");
}

async function verifyGitHubSignature(
  rawBody: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature.startsWith("sha256=")) {
    return false;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = `sha256=${toHex(new Uint8Array(digest))}`;
  return timingSafeEqual(expected, signature);
}

async function sendFeishuCard(env: Env, notification: Notification): Promise<void> {
  const body: any = {
    msg_type: "interactive",
    card: {
      config: { wide_screen_mode: true },
      header: {
        template: notification.event === "pull_request" ? "blue" : "orange",
        title: {
          tag: "plain_text",
          content: truncate(notification.title, 120)
        }
      },
      elements: [
        {
          tag: "div",
          text: {
            tag: "lark_md",
            content: [
              "**来源:** Github",
              `**仓库:** ${notification.repoFullName}`,
              `**作者:** ${notification.senderLogin}`,
              `**动作:** ${formatAction(notification.action)}`,
              notification.authorAssociation
                ? `**身份:** ${formatAssociation(notification.authorAssociation)}`
                : undefined,
              notification.summary ? `**摘要:** ${escapeMd(notification.summary)}` : undefined
            ]
              .filter(Boolean)
              .join("\n")
          }
        },
        {
          tag: "action",
          actions: buildActions(notification)
        }
      ]
    }
  };

  if (env.FEISHU_BOT_SIGN_KEY) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    body.timestamp = timestamp;
    body.sign = await signFeishu(timestamp, env.FEISHU_BOT_SIGN_KEY);
  }

  const response = await fetch(env.FEISHU_BOT_WEBHOOK, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body)
  });

  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Feishu webhook failed: ${response.status} ${responseText}`);
  }

  if (responseText) {
    const result = JSON.parse(responseText);
    const statusCode = result.StatusCode ?? result.code;
    if (statusCode !== undefined && statusCode !== 0) {
      const message = result.StatusMessage ?? result.msg ?? result.message ?? responseText;
      throw new Error(`Feishu webhook rejected message: ${statusCode} ${message}`);
    }
  }
}

function buildActions(notification: Notification): any[] {
  const primaryText = notification.event === "issues" ? "打开 Issue" : "打开 PR";
  const actions = [
    button(primaryText, notification.htmlUrl, "primary"),
    button("查看仓库", notification.repoUrl)
  ];

  if (notification.checksUrl) {
    actions.push(button("查看检查", notification.checksUrl));
  }
  actions.push(button("查看作者", notification.authorUrl));
  actions.push(
    button(
      "贡献指南",
      "https://github.com/tutti-os/.github/blob/main/CONTRIBUTING.md"
    )
  );

  return actions;
}

function formatAction(action: string): string {
  const actionMap: Record<string, string> = {
    opened: "新建",
    reopened: "重新打开",
    ready_for_review: "标记为可评审",
    created: "新增评论",
    submitted: "提交评审"
  };
  return actionMap[action] ?? action;
}

function formatAssociation(association: string): string {
  const associationMap: Record<string, string> = {
    NONE: "外部贡献者",
    FIRST_TIME_CONTRIBUTOR: "首次贡献者",
    FIRST_TIMER: "首次参与者",
    CONTRIBUTOR: "历史贡献者",
    COLLABORATOR: "协作者",
    MEMBER: "组织成员",
    OWNER: "组织所有者"
  };
  return associationMap[association] ?? association;
}

function button(content: string, url: string, type = "default"): any {
  return {
    tag: "button",
    text: { tag: "plain_text", content },
    url,
    type
  };
}

async function signFeishu(timestamp: string, secret: string): Promise<string> {
  const payload = `${timestamp}\n${secret}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new Uint8Array(),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(digest)));
}

function summarize(value: string | null | undefined): string {
  return truncate((value ?? "").replace(/\s+/g, " ").trim(), 220);
}

function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

function escapeMd(value: string): string {
  return value.replace(/\|/g, "\\|");
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" }
  });
}
