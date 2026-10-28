import type { PagesContext } from "../_shared/types";

type WikiSummary = { thumbnail?: { source?: string }; coordinates?: { lat?: number; lon?: number } };
type WikiMedia = { items?: { type?: string; srcset?: { src: string }[] }[] };
type WikiInfo = { lat?: number; lng?: number; photos: string[] };
const cache = new Map<string, WikiInfo>();
const HEADERS = { "User-Agent": "open-intelligent-ui-cf-pages (https://github.com/thesysdev/open-intelligent-ui)" };

async function get<T = unknown>(url: string): Promise<T | Record<string, never>> {
  const response = await fetch(url, { headers: HEADERS, signal: AbortSignal.timeout(8000) });
  if (response.status === 404) return {};
  if (!response.ok) throw new Error(`Wikipedia ${response.status}`);
  return response.json() as Promise<T>;
}

export async function onRequestGet({ request }: PagesContext) {
  const title = new URL(request.url).searchParams.get("title")?.trim();
  if (!title || title.length > 200) return Response.json({ error: { message: "title 为必填项，且不能超过 200 个字符。" } }, { status: 400 });
  let info = cache.get(title);
  if (!info) {
    const t = encodeURIComponent(title.replace(/ /g, "_"));
    try {
      const [summary, media]: [WikiSummary, WikiMedia] = await Promise.all([
        get<WikiSummary>(`https://en.wikipedia.org/api/rest_v1/page/summary/${t}`),
        get<WikiMedia>(`https://en.wikipedia.org/api/rest_v1/page/media-list/${t}`),
      ]);
      const photos: string[] = [];
      const key = (u: string) => decodeURIComponent(u.split("?")[0].split("/").slice(-1)[0]).replace(/^\d+px-/, "");
      if (summary?.thumbnail?.source) photos.push(summary.thumbnail.source);
      for (const item of media?.items ?? []) {
        if (item.type !== "image" || !item.srcset?.length) continue;
        const src = item.srcset[0].src;
        if (/\.svg|icon|logo|map|flag|seal/i.test(src)) continue;
        const url = src.startsWith("//") ? `https:${src}` : src;
        if (!photos.some((p) => key(p) === key(url))) photos.push(url);
        if (photos.length >= 3) break;
      }
      info = { lat: summary?.coordinates?.lat, lng: summary?.coordinates?.lon, photos };
      if (cache.size >= 500) cache.delete(cache.keys().next().value!);
      cache.set(title, info);
    } catch {
      return Response.json({ error: { message: "Wikipedia 暂不可用。" } }, { status: 502 });
    }
  }
  return Response.json(info, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
