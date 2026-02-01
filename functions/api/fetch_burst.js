function clampInt(n, min, max, fallback) {
  const x = Number(n);
  if (!Number.isFinite(x)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(x)));
}

function isAllowedUrl(u) {
  if (u.protocol !== "https:") return false;
  const host = u.hostname.toLowerCase();
  return host === "example.com" || host === "httpbin.org";
}

export async function onRequest(context) {
  const url = new URL(context.request.url);

  const target = url.searchParams.get("url") ?? "https://example.com";
  let u;
  try { u = new URL(target); } catch {
    return Response.json({ ok: false, error: "invalid url" }, { status: 400 });
  }
  if (!isAllowedUrl(u)) {
    return Response.json({ ok: false, error: "url not allowed" }, { status: 400 });
  }

  const n = clampInt(url.searchParams.get("n"), 1, 50, 10); // 并发次数
  const t0 = Date.now();

  const results = await Promise.allSettled(
    Array.from({ length: n }, async () => {
      const s = Date.now();
      const r = await fetch(u.toString(), { method: "GET" });
      const e = Date.now();
      return { status: r.status, ms: e - s };
    })
  );

  const t1 = Date.now();
  const ok = results.filter(r => r.status === "fulfilled").length;
  const fail = results.length - ok;

  const msList = results
    .filter(r => r.status === "fulfilled")
    .map(r => r.value.ms)
    .sort((a, b) => a - b);

  const p = (q) => (msList.length ? msList[Math.floor(q * (msList.length - 1))] : null);

  return Response.json({
    ok: true,
    route: "/api/fetch_burst",
    target: u.toString(),
    n,
    totalElapsedMs: t1 - t0,
    success: ok,
    failed: fail,
    p50: p(0.5),
    p95: p(0.95),
    p99: p(0.99),
    colo: context.request.cf?.colo ?? null,
  });
}
