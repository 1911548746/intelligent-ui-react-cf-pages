import type { ToolSpec } from "@openuidev/react-lang";

/**
 * Demo data tools for Query-backed dashboards: a store's orders, support
 * tickets and website traffic, generated for the days up to today. A day's
 * rows depend only on its date, so the same day always shows the same data.
 * Used by /gallery, the /preview page and the benchmark's dashboard prompts.
 */

const days = { type: "number", description: "How many days back from today, 1 to 365 (default 90)" };

export const demoToolSpecs: ToolSpec[] = [
  {
    name: "get_orders",
    description: "An online store's orders, one row per order, newest last",
    inputSchema: { type: "object", properties: { days } },
    outputSchema: {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              date: { type: "string", description: "YYYY-MM-DD 日期格式。" },
              region: { type: "string", enum: ["北部", "南部", "东部", "西部"] },
              channel: { type: "string", enum: ["网页", "移动端", "线下门店"] },
              category: { type: "string" },
              product: { type: "string" },
              units: { type: "number" },
              amount: { type: "number", description: "订单总金额，单位为 USD。" },
            },
          },
        },
      },
    },
  },
  {
    name: "get_tickets",
    description: "Support tickets opened, one row per ticket; hours and csat are set once a ticket is solved",
    inputSchema: { type: "object", properties: { days } },
    outputSchema: {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              opened: { type: "string", description: "YYYY-MM-DD 日期格式。" },
              team: { type: "string", enum: ["账单", "技术", "账户", "物流"] },
              priority: { type: "string", enum: ["低", "普通", "高", "紧急"] },
              status: { type: "string", enum: ["未处理", "待跟进", "已解决"] },
              hours: { type: "number", description: "解决工单所需小时数。" },
              csat: { type: "number", description: "满意度评分，范围为 1 至 5。" },
            },
          },
        },
      },
    },
  },
  {
    name: "get_traffic",
    description: "Daily website visits and signups, one row per day and source",
    inputSchema: { type: "object", properties: { days } },
    outputSchema: {
      type: "object",
      properties: {
        rows: {
          type: "array",
          items: {
            type: "object",
            properties: {
              date: { type: "string", description: "YYYY-MM-DD 日期格式。" },
              source: { type: "string", enum: ["搜索", "社交媒体", "邮件", "直接访问", "引荐"] },
              visits: { type: "number" },
              signups: { type: "number" },
            },
          },
        },
      },
    },
  },
];

const DAY = 86_400_000;

/** A small seeded generator (mulberry32), seeded from a string. */
function rng(seed: string): () => number {
  let h = 1779033703;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(r: () => number, list: readonly T[], weights?: readonly number[]): T => {
  if (!weights) return list[Math.floor(r() * list.length)]!;
  let x = r() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < list.length; i++) if ((x -= weights[i]!) < 0) return list[i]!;
  return list[list.length - 1]!;
};

/** The last `n` calendar days ending today (UTC), oldest first, as YYYY-MM-DD. */
function lastDays(input: unknown): string[] {
  const raw = Number((input as { days?: unknown } | null)?.days ?? 90);
  const n = Math.min(365, Math.max(1, Number.isFinite(raw) ? Math.round(raw) : 90));
  const today = Math.floor(Date.now() / DAY);
  return Array.from({ length: n }, (_, i) => new Date((today - n + 1 + i) * DAY).toISOString().slice(0, 10));
}

const weekday = (date: string) => new Date(`${date}T00:00:00Z`).getUTCDay();
// Slow growth over the year, so trends and period-over-period changes show
const growth = (date: string) => 1 + (Date.parse(date) / DAY - 20000) / 1500;

const PRODUCTS = [
  { product: "越野跑鞋", category: "户外", price: 128 },
  { product: "防雨外套", category: "户外", price: 164 },
  { product: "露营炉具", category: "户外", price: 89 },
  { product: "亚麻衬衫", category: "服饰", price: 58 },
  { product: "羊毛毛衣", category: "服饰", price: 96 },
  { product: "日常 T 恤", category: "服饰", price: 24 },
  { product: "陶瓷马克杯套装", category: "家居", price: 36 },
  { product: "橡木边桌", category: "家居", price: 210 },
  { product: "盖毯", category: "家居", price: 72 },
  { product: "无线耳机", category: "电子产品", price: 149 },
  { product: "智能台灯", category: "电子产品", price: 64 },
  { product: "便携音箱", category: "电子产品", price: 119 },
] as const;

function orders(input: unknown) {
  return lastDays(input).flatMap((date) => {
    const r = rng(`orders:${date}`);
    const weekend = weekday(date) === 0 || weekday(date) === 6;
    const count = Math.round((18 + r() * 14) * (weekend ? 1.35 : 1) * growth(date));
    return Array.from({ length: count }, (_, i) => {
      const p = pick(r, PRODUCTS, [9, 5, 4, 8, 5, 10, 6, 2, 4, 6, 5, 4]);
      const units = pick(r, [1, 1, 1, 2, 2, 3, 4]);
      const channel = pick(r, ["网页", "移动端", "线下门店"] as const, [5, 3 * growth(date), 2]);
      return {
        id: `${date.replaceAll("-", "")}-${i + 1}`,
        date,
        region: pick(r, ["北部", "南部", "东部", "西部"] as const, [3, 2, 3, 4]),
        channel,
        category: p.category,
        product: p.product,
        units,
        amount: Math.round(p.price * units * (0.85 + r() * 0.2) * 100) / 100,
      };
    });
  });
}

function tickets(input: unknown) {
  const all = lastDays(input);
  return all.flatMap((date, d) => {
    const r = rng(`tickets:${date}`);
    const age = all.length - 1 - d;
    const count = Math.round(6 + r() * 10);
    return Array.from({ length: count }, (_, i) => {
      const team = pick(r, ["账单", "技术", "账户", "物流"] as const, [3, 5, 2, 3]);
      const priority = pick(r, ["低", "普通", "高", "紧急"] as const, [3, 6, 3, 1]);
      const base = { 账单: 9, 技术: 22, 账户: 6, 物流: 14 }[team] * { 低: 1.6, 普通: 1, 高: 0.6, 紧急: 0.3 }[priority];
      const hours = Math.round(base * (0.4 + r() * 1.6) * 10) / 10;
      const solved = age * 24 > hours * 1.5 || r() < 0.2;
      const status = solved ? "已解决" : r() < 0.6 ? "未处理" : "待跟进";
      const csat = Math.min(5, Math.max(1, Math.round(5.4 - hours / 14 - r() * 1.8)));
      return {
        id: `T-${date.replaceAll("-", "").slice(2)}${String(i + 1).padStart(2, "0")}`,
        opened: date,
        team,
        priority,
        status,
        ...(solved ? { hours, ...(r() < 0.7 ? { csat } : {}) } : {}),
      };
    });
  });
}

function traffic(input: unknown) {
  const sources = { 搜索: [1800, 0.021], 社交媒体: [950, 0.012], 邮件: [420, 0.045], 直接访问: [700, 0.03], 引荐: [300, 0.035] } as const;
  return lastDays(input).flatMap((date) => {
    const r = rng(`traffic:${date}`);
    const weekend = weekday(date) === 0 || weekday(date) === 6;
    return Object.entries(sources).map(([source, [visits, rate]]) => {
      const v = Math.round(visits * (weekend ? 0.75 : 1) * growth(date) * (0.8 + r() * 0.4));
      return { date, source, visits: v, signups: Math.round(v * rate * (0.7 + r() * 0.6)) };
    });
  });
}

/** The function-map tool provider for `Renderer`. */
export const demoTools: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = {
  get_orders: async (args) => ({ rows: orders(args) }),
  get_tickets: async (args) => ({ rows: tickets(args) }),
  get_traffic: async (args) => ({ rows: traffic(args) }),
};
