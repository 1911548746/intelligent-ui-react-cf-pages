import type { PagesContext } from "../_shared/types";

const cache = new Map<string, [number, number][]>();
const MAX_STOPS = 25;

export async function onRequestGet({ request }: PagesContext) {
  const coords = new URL(request.url).searchParams.get("coords") ?? "";
  const points = coords.split(";").map((pair) => pair.split(",").map(Number));
  const valid = points.length >= 2 && points.length <= MAX_STOPS && points.every(([lng, lat, ...rest]) => !rest.length && Number.isFinite(lng) && Number.isFinite(lat) && Math.abs(lng) <= 180 && Math.abs(lat) <= 90);
  if (!valid) return Response.json({ error: { message: `coords 必须包含 2–${MAX_STOPS} 个“经度,纬度”坐标对。` } }, { status: 400 });
  const key = points.map((point) => point.join(",")).join(";");
  let route = cache.get(key);
  if (!route) {
    try {
      const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${key}?overview=full&geometries=geojson&steps=false`, { headers: { "User-Agent": "open-intelligent-ui-cf-pages (https://github.com/thesysdev/open-intelligent-ui)" }, signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error(`OSRM ${response.status}`);
      const data: { code?: string; routes?: { geometry?: { coordinates?: [number, number][] } }[] } = await response.json();
      const coordinates = data.routes?.[0]?.geometry?.coordinates ?? [];
      if (data.code !== "Ok" || coordinates.length < 2) throw new Error("No street route");
      route = coordinates.map(([lng, lat]) => [lat, lng]);
      if (cache.size >= 200) cache.delete(cache.keys().next().value!);
      cache.set(key, route);
    } catch { return Response.json({ error: { message: "道路路线服务暂不可用。" } }, { status: 502 }); }
  }
  return Response.json({ points: route }, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
