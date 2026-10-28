import type { PagesContext } from "../_shared/types";

const cache = new Map<string, string[]>();
const HEADERS = { "User-Agent": "open-intelligent-ui-cf-pages (https://github.com/thesysdev/open-intelligent-ui)" };
const SKIP = /\.svg|icon|logo|map|flag|seal|coat_of_arms|signature|diagram/i;
const WIDTH = 960;
type Page = { index?: number; title?: string; thumbnail?: { source?: string }; imageinfo?: { thumburl?: string; url?: string; mime?: string }[] };

async function query(host: string, params: Record<string, string>): Promise<Page[]> {
  const url = `https://${host}/w/api.php?${new URLSearchParams({ action: "query", format: "json", formatversion: "2", ...params })}`;
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`${host} ${response.status}`);
  const data: { error?: unknown; query?: { pages?: Page[] } } = await response.json();
  if (data.error) throw new Error(`${host} error`);
  return (data.query?.pages ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
}

const words = (text: string) => text.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 3);

async function search(q: string): Promise<string[]> {
  const images: string[] = [];
  const add = (url: string | undefined) => { if (url?.startsWith("https://") && !SKIP.test(url) && !images.includes(url)) images.push(url); };
  const wanted = new Set(words(q));
  const articles = await query("en.wikipedia.org", { generator: "search", gsrsearch: q, gsrlimit: "6", prop: "pageimages", piprop: "thumbnail", pithumbsize: String(WIDTH) });
  articles.filter((page) => words(page.title ?? "").some((word) => wanted.has(word))).forEach((page) => add(page.thumbnail?.source));
  const terms = q.split(/\s+/);
  const tries = [...new Set([terms.join(" "), terms.slice(0, 3).join(" "), terms.slice(0, 2).join(" ")])];
  for (const term of tries) {
    if (images.length >= 3) break;
    const files = await query("commons.wikimedia.org", { generator: "search", gsrsearch: `${term} filetype:bitmap`, gsrnamespace: "6", gsrlimit: "6", prop: "imageinfo", iiprop: "url|mime", iiurlwidth: String(WIDTH) });
    files.forEach((page) => { const info = page.imageinfo?.[0]; if (info?.mime?.startsWith("image/")) add(info.thumburl ?? info.url); });
  }
  return images.slice(0, 4);
}

export async function onRequestGet({ request }: PagesContext) {
  const q = new URL(request.url).searchParams.get("q")?.replace(/\s+/g, " ").trim();
  if (!q || q.length < 2 || q.length > 200) return Response.json({ error: { message: "q 必须包含 2 至 200 个字符。" } }, { status: 400 });
  let images = cache.get(q);
  if (!images) {
    try { images = await search(q); } catch { return Response.json({ error: { message: "图片搜索暂不可用。" } }, { status: 502 }); }
    if (cache.size >= 500) cache.delete(cache.keys().next().value!);
    cache.set(q, images);
  }
  return Response.json({ images }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
