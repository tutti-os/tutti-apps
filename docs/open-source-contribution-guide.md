# Open Source Contribution Guide Proposal

## 目标

这份方案用于一个拥有多个 GitHub 仓库的开源组织。目标不是把外部贡献流程做得很重，而是先建立一套轻量、统一、可自动化的贡献规范：

- 让外部开发者知道如何提交高质量 Issue 和 PR
- 让维护者能快速判断 PR 是否值得 review
- 让非组织成员的 Issue/PR 自动通知到内部群
- 通过最少门禁降低低质量、无上下文、AI 生成但未经验证的贡献
- 明确允许贡献者不先建 Issue，直接提交上下文完整的 PR

## 推荐组织结构

建议在 GitHub 组织下创建一个特殊仓库：

```text
.github
```

在这个仓库里维护组织级默认文件：

```text
.github/
  CONTRIBUTING.md
  CODE_OF_CONDUCT.md
  SECURITY.md
  SUPPORT.md
  GOVERNANCE.md
  MAINTAINERS.md
  .github/
    PULL_REQUEST_TEMPLATE.md
    ISSUE_TEMPLATE/
      bug_report.yml
      feature_request.yml
      question.yml
```

GitHub 会把这些文件作为组织级默认社区健康文件。单个仓库如果没有自己的贡献规范和模板，就会继承这套默认规则。

但要注意：组织级 `.github` 主要影响 GitHub 页面、Issue 模板和 PR 模板，不等于所有 AI coding agent 都会自动读取。为了让 AI 和外部开发者在每个仓库都能看到同一套规范，每个独立仓库还应该保留一个很薄的本地指针文件：

```text
AGENTS.md
CONTRIBUTING.md
```

本地 `AGENTS.md` 给 AI agent 读，本地 `CONTRIBUTING.md` 给开发者和 GitHub 页面读。它们不需要复制整套规范，只需要链接到组织级规范，并补充仓库自己的特殊规则。

## 分层贡献策略

组织里不同仓库的开放程度可以不同，不建议所有仓库一刀切。

| 仓库类型 | 外部贡献策略 | 示例规则 |
|---|---|---|
| 核心产品/核心框架 | 谨慎接受 | 允许直接 PR；大功能可能会被维护者要求转为设计讨论 |
| 插件/示例/模板 | 鼓励接受 | 允许外部开发者直接提交 PR |
| 文档/翻译 | 高度开放 | 放宽门槛，重点检查准确性 |
| 实验仓库 | 开放但低承诺 | 明确 API 和兼容性可能变化 |

## Issue 规范

Issue 不需要复杂流程，但必须提供足够上下文。

### Bug Report

Bug issue 应包含：

- 问题描述
- 复现步骤
- 期望结果
- 实际结果
- 环境信息，例如 OS、版本、浏览器、Node.js 版本
- 日志、截图或最小复现仓库，如果适用

### Feature Request

功能建议应包含：

- 想解决的问题
- 用户场景
- 建议方案
- 可接受的替代方案
- 是否愿意提交 PR

### Question

普通问题优先进入 Discussions 或社区群。如果组织暂时不用 Discussions，可以保留 `question` issue 类型，但需要说明它可能不会像 bug 一样被优先处理。

## PR 规范

允许贡献者不先创建 Issue，直接提交 PR。

PR 不强制关联 Issue，但必须让 reviewer 能快速理解变更。维护者可以在 review 中判断是否需要补充设计讨论；如果变更范围过大、方向不明确，维护者可以要求先转成 Issue、Discussion 或 RFC。

### PR 必填内容

每个 PR 必须包含：

- What：这个 PR 改了什么
- Why：为什么需要这个变更
- How：大致如何实现
- Test：如何验证
- Risk：是否有兼容性、性能、安全或迁移风险

### PR 标题

推荐所有 PR 标题使用 conventional commit 风格。核心仓库、发布敏感仓库或维护压力较高的仓库，可以把这个规则升级为 required check；非核心仓库第一阶段建议先用 warning 或 reviewer 提醒。

```text
feat: add webhook notification for external PRs
fix: avoid duplicate group messages
docs: update contribution guide
test: cover notification filtering
chore: update dependencies
```

推荐允许的类型：

```text
feat
fix
docs
test
refactor
perf
build
ci
chore
revert
```

可以带 scope：

```text
feat(webhook): notify group for external pull requests
fix(cli): handle empty config file
docs(contributing): clarify AI disclosure
```

拼写修正、文档小改、依赖更新也建议使用 conventional commit 风格，例如：

```text
docs: fix typo in README
chore: update dependency metadata
fix: correct example command
```

## AI/LLM 辅助贡献规则

允许使用 AI/LLM 辅助提交 Issue 或 PR，但需要披露和负责。

贡献者需要在 PR 中说明：

- 使用了什么工具或模型
- AI 参与了哪些部分，例如代码、测试、文档、重构
- 自己做了哪些人工 review 和验证

建议规则：

- AI 生成内容必须由提交者人工检查
- 提交者必须能回应 review comment
- 不能批量提交未经验证的 AI PR
- 非维护者同一时间最多保留 1 个 AI 辅助 PR 处于 review 中

## AI Agent 如何知道要遵循规范

如果规范只放在组织级 `.github` 仓库，AI agent 不一定会自动读取它。尤其是仓库单独拆出去之后，AI 通常只会优先读取当前仓库里的 `AGENTS.md`、`README.md`、`CONTRIBUTING.md`、工具配置和当前对话上下文。

因此建议使用“五层约束”：组织级规范、仓库内可见、CI 可检查、反馈可修复、新仓库可继承。

### 第 1 层：组织级规范

组织级 `.github` 仓库保存完整规范：

```text
.github/CONTRIBUTING.md
.github/.github/PULL_REQUEST_TEMPLATE.md
.github/.github/ISSUE_TEMPLATE/*
```

它负责统一对外口径、GitHub 默认模板和维护者流程。

### 第 2 层：仓库级指针

每个仓库根目录都放一个很短的 `AGENTS.md`：

```md
# Agent Instructions

This repository follows the organization contribution guide:

https://github.com/<org>/.github/blob/main/CONTRIBUTING.md

When working in this repository, agents must:

- Prefer a conventional commit PR title.
- Fill in the PR template.
- Include test evidence.
- Disclose AI/LLM assistance if used.
- Follow any repository-specific notes below.

Before finishing a change, agents must check:

- `git diff`
- relevant tests or a clear reason tests were not run
- whether the PR title follows `type(scope): summary` or `type: summary`

## Repository-specific notes

- ...
```

每个仓库也可以放一个很短的 `CONTRIBUTING.md`：

```md
# Contributing

This repository follows the organization contribution guide:

https://github.com/<org>/.github/blob/main/CONTRIBUTING.md

Repository-specific setup and test commands are documented in this README.
```

`AGENTS.md` 不要只写链接。AI 可能不会主动打开链接，所以必须在本地文件里放最关键的硬规则，例如 PR 标题、测试、AI 披露、仓库特殊命令。链接用于完整规范，本地文件用于最小必读规则。

### 第 3 层：CI 硬检查

AI 看到规则不代表一定会遵守，所以关键规则要尽量做成 GitHub Checks。第一阶段不要把所有模板字段都做成硬门禁，否则会让贡献流程太重。最小必做：

- PR 标题必须符合 conventional commit
- CI 测试必须通过

推荐但可选：

- PR body 包含 `What`、`Why`、`How`、`Test`、`Risk`
- AI Disclosure 不为空，可以填写 `N/A`
- PR 大小超限提醒

这些检查可以先只在核心仓库启用，或先作为 warning/comment，不阻塞合并。等贡献量变大、维护成本上升后，再升级为 required checks。

PR 标题检查可以用现成 Action，也可以用一个简单脚本。示例：

```yaml
name: PR checks

on:
  pull_request:
    types: [opened, edited, synchronize, reopened]

jobs:
  pr-title:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR title
        env:
          PR_TITLE: ${{ github.event.pull_request.title }}
        run: |
          echo "$PR_TITLE" | grep -Eq '^(feat|fix|docs|test|refactor|perf|build|ci|chore|revert)(\([a-z0-9._-]+\))?: .+'
```

如果后续要启用 PR body 检查，可以参考下面的可选示例：

```yaml
  pr-body:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR body sections
        env:
          PR_BODY: ${{ github.event.pull_request.body }}
        run: |
          for section in "## What" "## Why" "## How" "## Test" "## Risk" "## AI Disclosure"; do
            echo "$PR_BODY" | grep -F "$section" >/dev/null || {
              echo "Missing required PR section: $section"
              exit 1
            }
          done
```

### 第 4 层：失败反馈写给 AI 看

当检查失败时，错误信息要写得像任务说明，而不是只写 `invalid title`。这样 AI agent 看到 CI 失败后能直接修。

推荐失败信息：

```text
PR title must use conventional commit format.

Valid examples:
- feat: add webhook notification
- fix(cli): handle empty config
- docs: update contribution guide

Current title:
<actual title>
```

PR body 缺字段时：

```text
PR body is missing required sections.

Please update the PR description with:
- ## What
- ## Why
- ## How
- ## Test
- ## Risk
- ## AI Disclosure
```

这类反馈对人和 AI 都有效。维护者也可以直接评论：

```text
Please update this PR to follow AGENTS.md:

1. Rename the PR title to conventional commit format.
2. Fill in the Test and Risk sections.
3. Add AI Disclosure, or write N/A.
```

### 第 5 层：新仓库继承机制

为了避免拆仓库后规范丢失，创建新仓库时必须通过统一模板或初始化脚本。

推荐模板仓库包含：

```text
AGENTS.md
CONTRIBUTING.md
README.md
```

核心仓库或维护压力较高的仓库，可以额外加入 `.github/workflows/pr-checks.yml`。核心仓库或敏感路径较多的仓库，可以再加入 `CODEOWNERS`。

这样 AI agent 进入任意新仓库时，能先读到 `AGENTS.md`；GitHub 上创建 PR 时，能看到 PR 模板。需要硬门禁的核心仓库，再单独启用 PR 标题检查或 CODEOWNERS。

### 新仓库模板

repository template 可以做到“新仓库创建时复制标准文件”。GitHub 支持从模板仓库生成新仓库，新仓库会带上模板里的目录结构和文件。

它适合放这些初始文件：

```text
AGENTS.md
CONTRIBUTING.md
.github/PULL_REQUEST_TEMPLATE.md
```

核心仓库可以额外加入 `.github/workflows/pr-checks.yml` 和 `CODEOWNERS`，并配合 branch protection 或 rulesets 要求对应检查或 owner review。

但 repository template 不是持续继承机制。新仓库创建后，模板仓库后续改了 `AGENTS.md`、workflow 或 `CODEOWNERS`，已经创建出来的仓库不会自动同步。

| 能做到 | 做不到 |
|---|---|
| 新仓库初始带上 `AGENTS.md` | 已创建仓库自动跟随模板更新 |
| 新仓库初始带上 `CONTRIBUTING.md` | 自动开启 branch protection / ruleset |
| 核心仓库可手动加入 `.github/workflows/pr-checks.yml` | 自动设置 required checks |
| 核心仓库可手动加入 `CODEOWNERS` | 自动配置团队权限 |
| 新仓库初始带上 PR 模板 | 自动保证未来模板不漂移 |

所以推荐组合是：

1. repository template 负责新仓库初始文件。
2. 组织级 `.github` 负责默认社区文件和 PR/Issue 模板兜底。
3. GitHub Rulesets 或 branch protection 负责 required checks。
4. 定期巡检脚本负责发现旧仓库缺文件或规范漂移。

如果不想在每个仓库复制 PR 模板，可以只复制 `AGENTS.md` 和 `CONTRIBUTING.md` 指针，PR 模板继续走组织级 `.github` 默认模板。

### 定期检查

可以加一个轻量巡检脚本或 GitHub Action，定期检查组织内仓库是否包含：

- `AGENTS.md`
- `CONTRIBUTING.md` 或组织级默认继承
- `.github/PULL_REQUEST_TEMPLATE.md` 或组织级默认继承
- `CODEOWNERS`，核心仓库必需

发现缺失后自动开 PR 或发维护者提醒。

## PR 模板建议

可以把下面内容放到组织级 `.github/PULL_REQUEST_TEMPLATE.md`。

```md
## What

<!-- What does this PR change? -->

## Why

<!-- Why is this change needed? What problem does it solve? -->

## How

<!-- Briefly describe the implementation approach. -->

## Test

<!-- How did you verify this change? Include commands, screenshots, or manual steps. -->

## Risk

<!-- Compatibility, migration, security, performance, or UX risks. Write "None" if not applicable. -->

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Documentation
- [ ] Test
- [ ] Refactor
- [ ] CI / infrastructure

## AI Disclosure

<!-- If AI/LLM tools were used, describe the tool and how you reviewed the output. Write "N/A" if not used. -->

AI tool used:

Human review and verification:

## Screenshots

<!-- Required for visible UI changes. Otherwise write "N/A". -->
```

## 外部贡献者通知机制

如果组织会有多个仓库，推荐从 GitHub Organization Webhook 开始，而不是每个仓库单独配置 GitHub Action 或仓库级 webhook。

第一阶段目标是做一个轻量通知网关：

```text
GitHub Organization Webhook
        ↓
轻量通知服务 / Serverless Function
        ↓
过滤事件、判断是否外部贡献者
        ↓
飞书自定义机器人 Webhook
        ↓
飞书贡献者 triage 群
```

这套方式适合多仓库，因为所有仓库事件从一个入口进入，后续新增仓库不容易漏通知，也方便统一过滤、统一格式和统一路由。

默认建议创建普通飞书群，而不是话题群。普通群对机器人、消息卡片、成员管理和通知习惯最稳。话题群可以作为后续选项：只有当团队明确希望每个 PR/Issue 形成独立讨论串，并且验证机器人卡片在话题群中的展示和通知体验满足要求后，再切换。

第一阶段不建议直接做完整 GitHub App。GitHub App 更适合后续需要更强写权限、安装管理、复杂权限模型或飞书卡片交互时再引入。

| 方案 | 适合场景 | 优点 | 限制 |
|---|---|---|---|
| 每仓库 GitHub Action -> 飞书机器人 | 仓库很少，临时通知 | 最快，不需要部署服务 | 多仓库容易漏配，规则分散 |
| Organization Webhook -> 通知服务 -> 飞书群卡片 | 多仓库组织 | 一个入口，统一过滤、去重、路由 | 需要维护一个很薄的服务 |
| GitHub App -> 通知/治理服务 -> 飞书应用 | 成熟阶段 | 权限模型完整，可做复杂自动化 | 初始成本高 |

### 监听事件

MVP 阶段建议只监听：

- `issues`
- `pull_request`
- `issue_comment`

贡献量上升后再考虑增加：

- `pull_request_review`
- `pull_request_review_comment`
- `workflow_run`
- `check_suite`
- `repository`

其中 `repository` 事件可以用于发现新仓库，然后提醒维护者确认是否已经带上 `AGENTS.md`、`CONTRIBUTING.md` 和基础 workflow。

### 通知服务职责

通知服务保持轻量即可，不要在第一版做成完整治理平台。

MVP 职责：

1. 校验 GitHub webhook 签名。
2. 根据事件类型和 action 过滤噪音。
3. 忽略 bot、组织成员、仓库 collaborator。
4. 识别外部贡献者的 Issue、PR、评论。
5. 组装飞书消息卡片。
6. 推送到飞书贡献者 triage 群。
7. 对 GitHub delivery id 做简单去重。

后续可选职责：

- 按仓库路由到不同飞书群。
- 自动添加 `external-contributor`、`needs-triage` 标签。
- 对 `needs-info` 做超时提醒。
- 生成每日/每周贡献摘要。
- 对高优先级仓库单独 @ 维护者。
- 发现新仓库缺少 `AGENTS.md` 或 workflow 时提醒。

### 通知服务部署选型

这个服务只需要做三件事：接收 GitHub webhook、调用 GitHub API 判断身份、调用飞书机器人 webhook 发消息。因此它适合放在轻量 Serverless 平台上。

推荐选型：

| 平台 | 推荐度 | 适合场景 | 说明 |
|---|---:|---|---|
| Cloudflare Workers | 高 | 想最快上线、全球入口、代码很薄 | 适合 webhook 网关；支持 secrets、`fetch` 出网、日志和简单 KV/队列扩展 |
| AWS Lambda Function URL | 高 | 已经在 AWS，想少配 API Gateway | Lambda 原生 HTTPS endpoint，适合单函数 webhook |
| AWS API Gateway + Lambda | 中高 | 需要更强路由、鉴权、限流、WAF | 比 Function URL 重，但控制力更强 |
| Vercel Functions | 中 | 团队已有 Vercel 项目 | 上手快，适合 Node/TypeScript；注意不要和前端项目耦合太深 |
| Netlify Functions | 中 | 团队已有 Netlify | 类似 Vercel，适合轻量 webhook |
| 阿里云函数计算 FC HTTP 触发器 | 中高 | 团队主要在国内云、飞书访问稳定优先 | 适合中国团队；需要实际测试 GitHub webhook 到函数入口的连通性 |
| 腾讯云云函数 SCF / 函数 URL | 中 | 团队主要在腾讯云 | 适合国内云环境；注意具体 HTTP 触发能力和产品迁移限制 |
| Google Cloud Run / Cloud Functions | 中 | 已经在 GCP，想用容器或 Secret Manager | Cloud Run 更像轻量容器服务，适合后续逻辑变复杂 |
| Azure Functions HTTP Trigger | 中 | 已经在 Azure / Microsoft 生态 | HTTP trigger 可以用于 webhook |

不推荐把业务逻辑直接放在 CloudFront Functions。

原因：

- CloudFront Functions 更适合 CDN 边缘请求改写、鉴权、重定向等极轻逻辑。
- 它不适合调用 GitHub API 或飞书 webhook。
- 它也不适合保存和使用 webhook secret、GitHub token、飞书机器人密钥这类业务配置。

如果使用 AWS，推荐从 `Lambda Function URL` 开始；只有需要统一域名、WAF、复杂路由或更强访问控制时，再升级到 `API Gateway + Lambda`，必要时前面再接 CloudFront/WAF。

MVP 推荐：

```text
GitHub Organization Webhook
        ↓
Cloudflare Worker 或 AWS Lambda Function URL
        ↓
GitHub API / 飞书群卡片
```

需要保存的密钥：

```text
GITHUB_WEBHOOK_SECRET
GITHUB_TOKEN
FEISHU_BOT_WEBHOOK
FEISHU_BOT_SIGN_KEY
```

实现时必须注意：

- 使用原始 request body 校验 GitHub `X-Hub-Signature-256`。
- 飞书机器人启用签名校验。
- 不把 GitHub token 或飞书 webhook 写进代码仓库。
- 对 GitHub delivery id 做幂等去重。
- 日志里不要打印完整 token、webhook URL 或签名。

### 外部人员判断

收到 webhook 后，服务端再调用 GitHub API 判断用户身份：

- 是否组织成员
- 是否仓库 collaborator
- 是否 bot

推荐分类：

| 类型 | 处理方式 |
|---|---|
| 组织成员 | 不推群，或低优先级汇总 |
| 仓库 collaborator | 不推群，或低优先级汇总 |
| 外部开发者 | 推送到飞书贡献者 triage 群 |
| Bot | 只推异常或失败事件 |

### 飞书群卡片

通知应该发到飞书贡献者 triage 群，并使用卡片形式，而不是普通纯文本消息。

卡片目标：

- 一眼看出是哪个仓库、哪个 PR/Issue、谁提交、当前状态。
- 标明是否外部贡献者、首次贡献者、是否需要 triage。
- 直接点击按钮跳转到 GitHub 对应页面。
- 对 CI 失败、review 请求、需要补充信息等状态做醒目提示。

PR 卡片建议字段：

```text
标题: [External PR] repo-name#123 feat: add webhook notification
提交者: @username
仓库: org/repo
状态: opened / reopened / ready_for_review
标签: external-contributor, needs-triage
摘要: PR body 前 1-2 行或自动摘要
时间: 2026-06-23 12:00
```

Issue 卡片建议字段：

```text
标题: [External Issue] repo-name#456 Bug: cannot login with SSO
提交者: @username
仓库: org/repo
状态: opened
标签: external-contributor, needs-triage
摘要: Issue body 前 1-2 行或自动摘要
时间: 2026-06-23 12:00
```

卡片按钮建议：

| 按钮 | 跳转目标 | MVP 是否需要 |
|---|---|---:|
| Open PR | GitHub PR URL | 是 |
| Open Issue | GitHub Issue URL | 是 |
| View Repository | GitHub repo URL | 是 |
| View Checks | PR checks / workflow run URL | 可选 |
| View Author | GitHub user URL | 可选 |
| Contribution Guide | 组织级 CONTRIBUTING.md | 可选 |

MVP 阶段按钮只做跳转，不做状态写回。这样用飞书自定义机器人即可完成。

如果后续需要在卡片里点击“认领”“标记已处理”“添加标签”“关闭通知”等交互动作，就需要升级为飞书自建应用，因为自定义机器人更适合单向推送，不适合承载复杂交互和权限控制。

### 飞书自定义机器人 vs 自建应用

是否一开始使用飞书自建应用，取决于卡片按钮是否需要回调到服务端。

| 能力 | 自定义机器人 | 企业自建应用 |
|---|---|---|
| 发消息到群 | 支持 | 支持 |
| 发送消息卡片 | 支持 | 支持 |
| 按钮跳转 URL | 支持 | 支持 |
| 点击按钮回调服务端 | 不适合 / 不支持复杂回调 | 支持 |
| 点击“认领/已处理”后更新 GitHub 标签 | 不适合 | 支持 |
| 点击后更新原卡片状态 | 不适合 | 支持 |
| 权限控制、用户身份识别 | 弱 | 强 |
| 配置复杂度 | 低 | 中高 |
| 是否需要管理员审核 | 通常低 | 取决于权限和发布流程 |

建议：

- MVP：使用自定义机器人，卡片按钮只跳转 GitHub。
- 如果明确要在飞书内完成 triage 操作：使用企业自建应用。
- 如果只是“Open PR / Open Issue / View Checks”这类跳转按钮，自建应用不是必须。

自建应用适合的按钮：

```text
认领
标记已处理
添加 needs-info
添加 external-contributor
关闭通知
重新推送
```

自建应用需要额外处理：

- 在飞书开发者后台创建企业自建应用。
- 开启机器人能力。
- 申请发送消息、读取群信息等权限。
- 配置卡片回调请求地址或长连接模式。
- 处理回调安全校验、解密和幂等。
- 将飞书用户身份映射到维护者身份。
- 调 GitHub API 写标签、评论或更新状态。
- 发布应用版本，并按企业要求完成管理员审核。

### lark-cli 能做什么

`lark-cli` 可以降低调试和自动化成本，但不能完全一键替代飞书开发者后台。

适合用 `lark-cli` 做：

- 检查当前应用授权和 scope。
- 搜索或创建群聊。
- 查询 `chat_id`。
- 用 bot 身份发送测试消息。
- 调试消息卡片 JSON。
- 使用通用 API 调用飞书开放平台接口。
- 在本地消费/调试部分飞书事件。

不适合指望 `lark-cli` 一键完成：

- 创建企业自建应用。
- 自动完成应用发布和管理员审核。
- 自动申请所有权限并让权限生效。
- 自动配置所有卡片回调和事件订阅。
- 自动部署 GitHub webhook 服务。
- 自动完成 GitHub token、飞书密钥、回调 URL 的生产级密钥管理。

因此，自建应用的合理落地方式是：

```text
人工一次性创建飞书企业自建应用
        ↓
配置权限、机器人能力、卡片回调
        ↓
lark-cli 辅助查群、发测试消息、调试 API
        ↓
通知服务处理 GitHub webhook 和飞书卡片回调
```

也就是说，`lark-cli` 可以让开发和调试更快，但不能把完整生产接入变成零配置一键完成。

### 自动标签

如果通知服务配置了 GitHub token，可以在外部贡献者创建 Issue 或 PR 时自动添加：

```text
external-contributor
needs-triage
```

如果第一阶段不想给通知服务写权限，也可以先不自动打标签，只做飞书通知。等贡献量上升后，再给服务增加最小写权限来打标签。

如果模板缺失关键信息，可以添加：

```text
needs-info
```

如果是首次贡献者，可以添加：

```text
first-time-contributor
```

## 自动化门禁

第一阶段建议只做低成本检查。

### 必做

- 核心仓库检查 PR 标题是否符合 conventional commit 风格
- 核心仓库 CI 测试通过
- 外部贡献者飞书群卡片通知

### 可选

- CLA 或 DCO
- signed commits
- PR 模板字段检查
- AI Disclosure 必填检查
- PR 大小检查
- CODEOWNERS required review
- 外部贡献者自动标签
- stale issue 自动提醒
- `needs-info` 超时自动关闭

## 维护者处理流程

### Issue Triage

维护者收到外部 Issue 后：

1. 判断是否有效
2. 补充标签
3. 需要更多信息则标记 `needs-info`
4. 可复现 bug 标记 `confirmed`
5. 有价值功能建议标记 `proposal`
6. 不适合当前路线图则礼貌关闭或转 Discussions

### PR Triage

维护者收到外部 PR 后：

1. 检查 PR 描述是否完整
2. 检查变更范围是否聚焦
3. 检查测试说明是否可信
4. 决定进入 review、要求补充信息或关闭
5. 对大功能 PR，可以要求先转为设计讨论

## 建议标签体系

```text
type: bug
type: feature
type: docs
type: question
type: refactor

status: needs-triage
status: needs-info
status: confirmed
status: blocked
status: ready-for-review

source: external-contributor
source: maintainer
source: bot

priority: p0
priority: p1
priority: p2
priority: p3

area: frontend
area: backend
area: docs
area: ci
area: security
```

## 推荐落地顺序

### 第 1 周：建立基础规范

- 创建组织级 `.github` 仓库
- 添加 `CONTRIBUTING.md`
- 添加 PR 模板
- 添加 Issue 模板
- 添加 `CODE_OF_CONDUCT.md`
- 添加 `SECURITY.md`
- 为新仓库模板加入根目录 `AGENTS.md`
- 为新仓库模板加入轻量 `CONTRIBUTING.md` 指针文件

### 第 2 周：接入通知

- 创建 GitHub Organization Webhook
- 部署轻量通知服务或 Serverless Function
- 接入飞书自定义机器人 Webhook
- 判断外部贡献者身份
- 推送外部 Issue/PR 到群
- 可选：自动添加 `external-contributor` 和 `needs-triage`

### 第 3 周：增加轻量门禁

- 核心仓库启用 conventional commit PR 标题检查
- 非核心仓库先使用 PR 标题 warning 或 reviewer 提醒
- 核心仓库启用 required CI
- PR 模板关键字段先作为提醒，不作为第一阶段硬门禁

### 第 4 周：优化治理

- 根据真实贡献情况调整标签
- 加入 stale/needs-info 自动处理
- 评估是否需要 CLA、DCO 或 signed commits
- 评估是否需要从 Organization Webhook 升级为 GitHub App
- 对核心仓库补充更严格规则

## 不建议一开始做的事

第一阶段不建议强制：

- 要求每个 PR 都必须先关联 Issue
- 每个功能都必须走完整 RFC
- 所有仓库都启用 signed commits
- 所有 PR 都必须 CLA
- 所有仓库都启用 CODEOWNERS required review
- 复杂的贡献者等级制度
- 大量 bot 自动评论

这些规则可以后续根据贡献量和维护压力逐步增加。

## 推荐原则

先让贡献者容易开始，再让维护者容易筛选。

轻量规则应该优先解决三个问题：

1. PR 有没有足够上下文
2. 维护者能不能快速判断风险
3. 外部贡献会不会被及时看到

只要这三点先跑起来，多仓库开源组织就已经有了一个可持续的贡献入口。
