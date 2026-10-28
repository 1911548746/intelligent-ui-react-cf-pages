# Open Intelligent UI · Cloudflare Pages demo

这是一个为 Cloudflare Pages 准备的精简演示版。Vite 生成静态前端，Pages Functions 提供同源 API，`/api/chat` 使用固定的 OpenUI Lang system prompt 调用一个 OpenAI-compatible Chat Completions 服务。

## 本地运行

```bash
npm install
copy .env.example .env.local
npm run dev
```

Vite 开发服务器只负责前端。要同时模拟 Pages Functions，请先构建，再运行：

```bash
npm run build
npx wrangler pages dev dist
```

本地模拟器会从当前 shell 环境读取 `LLM_BASE_URL`、`LLM_MODEL` 和 `LLM_API_KEY`。生产环境请在 Cloudflare Pages 的 Functions/运行时变量中配置它们，其中 API key 使用 Secret。

## Cloudflare Pages

Git 集成设置如下：

| 设置 | 值 |
| --- | --- |
| Framework preset | None / Other |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | 留空 |
| Node.js | `24.22.0` |

`functions/` 必须位于仓库根目录。它不会被复制到 `dist`，Pages 会在部署时自动发现并绑定这些 Functions。

## 固定提示词

`src/generated/system-prompt.txt` 是组件库对应的固定提示词。`npm run build` 和 `npm run typecheck` 会先执行 `scripts/embed-system-prompt.mjs`，生成 `functions/_shared/system-prompt.generated.ts`。组件库变更后，应在原项目重新生成提示词，再复制该文本文件到这里。

## 支持的 API

- `POST /api/chat`：转发标准 Chat Completions SSE。
- `GET /api/wiki?title=...`：获取 Wikipedia 图片和坐标。
- `GET /api/image-search?q=...`：搜索 Wikimedia 图片。
- `GET /api/street-route?coords=...`：通过 OSRM 获取道路路线。

图片 URL 由 Wikimedia 返回，地图底图由 OpenFreeMap/OSM 提供；这些外部服务的可用性取决于访问者网络环境。
